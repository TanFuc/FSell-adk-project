import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  MousePointerClick, 
  TrendingUp, 
  Calendar, 
  RefreshCw,
  ExternalLink,
  Clock,
  Globe,
  Monitor,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/services/api";
import type { StreamLogEntry } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  getClickStats, 
  getClickHistory, 
  getClickDetails,
  getButtonDisplayName,
  type ClickStats,
  type ClickHistory,
  type ClickDetailsResponse,
} from "@/services/clickTracking";

export function AnalyticsTab() {
  const [selectedButton, setSelectedButton] = useState<string>("all");
  const [statsTimeRange, setStatsTimeRange] = useState<7 | 14 | 21 | 30>(30);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsLimit] = useState(20);
  
  const token = localStorage.getItem("accessToken") || undefined;

  // Fetch click statistics
  const { data: stats = [], isLoading: statsLoading, refetch: refetchStats, error: statsError } = useQuery<ClickStats[]>({
    queryKey: ["clickStats", selectedButton],
    queryFn: () => getClickStats(selectedButton === "all" ? undefined : selectedButton, token),
    retry: 1,
  });

  // Fetch click history
  const { data: history = [], isLoading: historyLoading, refetch: refetchHistory, error: historyError } = useQuery<ClickHistory[]>({
    queryKey: ["clickHistory", selectedButton, statsTimeRange],
    queryFn: () => getClickHistory(statsTimeRange, selectedButton === "all" ? undefined : selectedButton, token),
    retry: 1,
  });

  // Fetch detailed click records
  const { data: detailsData, isLoading: detailsLoading, refetch: refetchDetails, error: detailsError } = useQuery<ClickDetailsResponse>({
    queryKey: ["clickDetails", selectedButton, statsTimeRange, detailsPage, detailsLimit],
    queryFn: () => getClickDetails(
      statsTimeRange, 
      selectedButton === "all" ? undefined : selectedButton, 
      detailsPage, 
      detailsLimit, 
      token
    ),
    retry: 1,
  });

  const {
    data: recentLogs = [],
    isLoading: logsLoading,
    refetch: refetchLogs,
    error: logsError,
  } = useQuery<StreamLogEntry[]>({
    queryKey: ["recentLogs"],
    queryFn: () => adminApi.getRecentLogs(120),
    retry: 1,
    refetchInterval: 5000,
  });

  // Get all unique button names for filter
  const buttonOptions = stats?.map((stat) => stat.buttonName) || [];

  const handleRefresh = () => {
    refetchStats();
    refetchHistory();
    refetchDetails();
    refetchLogs();
  };

  // Calculate total stats based on time range
  const calculateStatsForRange = (stat: ClickStats) => {
    switch (statsTimeRange) {
      case 7:
        return stat.last7Days;
      case 14:
        return stat.last7Days + Math.floor((stat.last30Days - stat.last7Days) * 0.3);
      case 21:
        return stat.last7Days + Math.floor((stat.last30Days - stat.last7Days) * 0.6);
      case 30:
      default:
        return stat.last30Days;
    }
  };

  const totalStats = stats.reduce(
    (acc, stat) => ({
      totalClicks: acc.totalClicks + stat.totalClicks,
      last24Hours: acc.last24Hours + stat.last24Hours,
      currentRange: acc.currentRange + calculateStatsForRange(stat),
    }),
    { totalClicks: 0, last24Hours: 0, currentRange: 0 }
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getBrowserFromUserAgent = (userAgent: string | null): string => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {(statsError || historyError || detailsError || logsError) && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="text-red-600 font-semibold">Lỗi tải dữ liệu:</div>
            <div className="text-sm text-red-700">
              {statsError && "Không thể tải thống kê. "}
              {historyError && "Không thể tải lịch sử. "}
              {detailsError && "Không thể tải chi tiết. "}
              {logsError && "Không thể tải log stream. "}
              Vui lòng thử lại.
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phân tích Click</h2>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi chi tiết tương tác người dùng với các nút CTA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={statsTimeRange.toString()} 
            onValueChange={(val) => {
              setStatsTimeRange(parseInt(val) as 7 | 14 | 21 | 30);
              setDetailsPage(1);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày</SelectItem>
              <SelectItem value="14">14 ngày</SelectItem>
              <SelectItem value="21">21 ngày</SelectItem>
              <SelectItem value="30">30 ngày</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedButton} onValueChange={setSelectedButton}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn nút" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các nút</SelectItem>
              {buttonOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {getButtonDisplayName(name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng Click</p>
                <p className="text-2xl font-bold">{totalStats.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">24 giờ qua</p>
                <p className="text-2xl font-bold">{totalStats.last24Hours.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{statsTimeRange} ngày qua</p>
                <p className="text-2xl font-bold">{totalStats.currentRange.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="details">Chi tiết Click</TabsTrigger>
          <TabsTrigger value="logs">Log Stream</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Button Stats Table */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Thống kê theo nút</h3>
            </div>
            <div className="overflow-x-auto">
              {statsLoading ? (
                <div className="p-8 text-center text-gray-500">Đang tải...</div>
              ) : stats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Chưa có dữ liệu click tracking
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên nút
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        24h
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        7 ngày
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        30 ngày
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.map((stat) => (
                      <tr key={stat.buttonName} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {getButtonDisplayName(stat.buttonName)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {stat.buttonName}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-semibold">
                          {stat.totalClicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                          {stat.last24Hours.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                          {stat.last7Days.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                          {stat.last30Days.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Click History Chart */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Biểu đồ theo ngày</h3>
            </div>
            <div className="p-6">
              {historyLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Đang tải...
                </div>
              ) : history.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chưa có dữ liệu lịch sử
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => {
                    const maxClicks = Math.max(...history.map((h) => h.clicks));
                    const width = maxClicks > 0 ? (item.clicks / maxClicks) * 100 : 0;
                    
                    return (
                      <div key={item.date} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-600 flex-shrink-0">
                          {formatShortDate(item.date)}
                        </div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-end pr-3"
                            style={{ width: `${width}%`, minWidth: item.clicks > 0 ? '40px' : '0' }}
                          >
                            {item.clicks > 0 && (
                              <span className="text-xs font-semibold text-white">
                                {item.clicks}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Danh sách Click chi tiết</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tổng: {detailsData?.total.toLocaleString() || 0} click trong {statsTimeRange} ngày qua
                </p>
              </div>
              {detailsData && detailsData.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailsPage(p => Math.max(1, p - 1))}
                    disabled={detailsPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Trang {detailsPage} / {detailsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailsPage(p => Math.min(detailsData.totalPages, p + 1))}
                    disabled={detailsPage === detailsData.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              {detailsLoading ? (
                <div className="p-8 text-center text-gray-500">Đang tải...</div>
              ) : !detailsData || detailsData.data.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Chưa có dữ liệu click
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nút
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL Đích (Redirect)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL Trang
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nguồn (Referrer)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trình duyệt
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detailsData.data.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{formatDate(record.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 text-sm">
                              {getButtonDisplayName(record.buttonName)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {record.buttonName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {record.redirectUrl ? (
                            <a
                              href={record.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 max-w-xs font-medium"
                            >
                              <ExternalLink className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{record.redirectUrl}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {record.pageUrl ? (
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              <Globe className="w-4 h-4 inline mr-1 text-gray-400" />
                              {record.pageUrl}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {record.referrer ? (
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {record.referrer}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Direct</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {getBrowserFromUserAgent(record.userAgent)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 font-mono">
                              {record.ipAddress || "Unknown"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Log Stream API</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Dữ liệu mới nhất từ endpoint /api/logs/recent (auto refresh mỗi 5 giây)
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới log
              </Button>
            </div>
            <div className="overflow-x-auto">
              {logsLoading ? (
                <div className="p-8 text-center text-gray-500">Đang tải log...</div>
              ) : recentLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Chưa có log gần đây</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scope
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLogs.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(entry.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant={entry.level === "error" ? "destructive" : "outline"}>
                            {entry.level}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {entry.scope}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="max-w-2xl break-words">{entry.message}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
