param(
  [string]$BaseUrl = 'http://localhost:3010/api',
  [string]$AdminEmail = 'admin@adkpharma.vn',
  [string]$AdminPassword = 'Admin@2025'
)

$ErrorActionPreference = 'Stop'
$BackendDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend'
$TempDir = Join-Path $env:TEMP 'adk-r2-upload-tests'
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Push-Location $BackendDir
try {
  node -e "const sharp=require('sharp'); const fs=require('fs'); const path=require('path'); const crypto=require('crypto'); const out=process.argv[1]; (async()=>{ await sharp({create:{width:1400,height:900,channels:3,background:{r:40,g:160,b:120}}}).jpeg({quality:92}).toFile(path.join(out,'small.jpg')); const w=4200,h=3000; const buf=crypto.randomBytes(w*h*3); await sharp(buf,{raw:{width:w,height:h,channels:3}}).jpeg({quality:96}).toFile(path.join(out,'large.jpg')); const w2=3200,h2=3200; const buf2=crypto.randomBytes(w2*h2*3); await sharp(buf2,{raw:{width:w2,height:h2,channels:3}}).png({compressionLevel:0}).toFile(path.join(out,'oversize.png')); fs.writeFileSync(path.join(out,'not-image.txt'),'hello upload test'); })().catch(e=>{console.error(e); process.exit(1);});" "$TempDir"

  $small = Join-Path $TempDir 'small.jpg'
  $large = Join-Path $TempDir 'large.jpg'
  $oversize = Join-Path $TempDir 'oversize.png'
  $textFile = Join-Path $TempDir 'not-image.txt'

  $smallSize = (Get-Item $small).Length
  $largeSize = (Get-Item $large).Length
  $oversizeSize = (Get-Item $oversize).Length

  $loginBody = @{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType 'application/json' -Body $loginBody
  $token = $login.data.accessToken

  function Invoke-CurlUpload {
    param(
      [string]$FilePath,
      [string]$MimeType,
      [bool]$WithAuth = $true
    )

    $args = @('-s', '-w', "`nHTTPSTATUS:%{http_code};TIME:%{time_total}")
    if ($WithAuth) {
      $args += @('-H', "Authorization: Bearer $token")
    }
    $args += @('-F', "file=@$FilePath;type=$MimeType", "$BaseUrl/photo/admin/upload")
    return & curl.exe @args
  }

  $smallOut = Invoke-CurlUpload -FilePath $small -MimeType 'image/jpeg' -WithAuth $true
  $largeOut = Invoke-CurlUpload -FilePath $large -MimeType 'image/jpeg' -WithAuth $true

  $smallBody = ($smallOut -split "`nHTTPSTATUS:")[0]
  $smallStat = ($smallOut -split "`nHTTPSTATUS:")[1]
  $largeBody = ($largeOut -split "`nHTTPSTATUS:")[0]
  $largeStat = ($largeOut -split "`nHTTPSTATUS:")[1]

  $smallJson = $smallBody | ConvertFrom-Json
  $largeJson = $largeBody | ConvertFrom-Json

  $downloaded = Join-Path $TempDir 'downloaded.webp'
  Invoke-WebRequest -UseBasicParsing -Uri $largeJson.imageUrl -OutFile $downloaded
  $downloadMeta = node -e "const sharp=require('sharp'); (async()=>{const m=await sharp(process.argv[1]).metadata(); console.log(JSON.stringify(m));})().catch(e=>{console.error(e); process.exit(1);});" "$downloaded" | ConvertFrom-Json

  $noAuthOut = Invoke-CurlUpload -FilePath $small -MimeType 'image/jpeg' -WithAuth $false
  $textOut = Invoke-CurlUpload -FilePath $textFile -MimeType 'text/plain' -WithAuth $true
  $oversizeOut = Invoke-CurlUpload -FilePath $oversize -MimeType 'image/png' -WithAuth $true
  $missingOut = & curl.exe -s -w "`nHTTPSTATUS:%{http_code};TIME:%{time_total}" -H "Authorization: Bearer $token" "$BaseUrl/photo/admin/upload"

  [ordered]@{
    input = @{
      smallBytes = $smallSize
      largeBytes = $largeSize
      oversizeBytes = $oversizeSize
    }
    success = @{
      small = @{
        status = $smallStat
        body = $smallJson
      }
      large = @{
        status = $largeStat
        body = $largeJson
      }
    }
    transformed = @{
      downloadedMeta = $downloadMeta
    }
    errors = @{
      noAuth = @{
        status = ($noAuthOut -split "`nHTTPSTATUS:")[1]
        body = ($noAuthOut -split "`nHTTPSTATUS:")[0]
      }
      invalidMime = @{
        status = ($textOut -split "`nHTTPSTATUS:")[1]
        body = ($textOut -split "`nHTTPSTATUS:")[0]
      }
      oversize = @{
        status = ($oversizeOut -split "`nHTTPSTATUS:")[1]
        body = ($oversizeOut -split "`nHTTPSTATUS:")[0]
      }
      missingFile = @{
        status = ($missingOut -split "`nHTTPSTATUS:")[1]
        body = ($missingOut -split "`nHTTPSTATUS:")[0]
      }
    }
  } | ConvertTo-Json -Depth 10
}
finally {
  Pop-Location
}
