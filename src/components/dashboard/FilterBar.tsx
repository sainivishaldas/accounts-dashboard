import { useState } from "react";
import { Search, Filter, Download, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useCities, usePropertyNames } from "@/hooks/useSupabase";
import type { DateRange } from "react-day-picker";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onCityFilter: (city: string | null) => void;
  onPropertyFilter: (property: string | null) => void;
  onStatusFilter: (status: string | null) => void;
  onExport: (format: "csv" | "excel") => void;
}

export function FilterBar({
  onSearch,
  onCityFilter,
  onPropertyFilter,
  onStatusFilter,
  onExport,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: cities = [] } = useCities();
  const { data: properties = [] } = usePropertyNames();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange(undefined);
    onSearch("");
    onCityFilter(null);
    onPropertyFilter(null);
    onStatusFilter(null);
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by resident name, ID, or property..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="end">
              <button
                onClick={() => onExport("csv")}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                Export as CSV
              </button>
              <button
                onClick={() => onExport("excel")}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                Export as Excel
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 animate-fade-in">
          {/* City Filter */}
          <Select onValueChange={(v) => onCityFilter(v === "all" ? null : v)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Property Filter */}
          <Select onValueChange={(v) => onPropertyFilter(v === "all" ? null : v)}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property} value={property}>
                  {property}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select onValueChange={(v) => onStatusFilter(v === "all" ? null : v)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on_time">On Time</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="advance_paid">Advance Paid</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background">
                <Calendar className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
