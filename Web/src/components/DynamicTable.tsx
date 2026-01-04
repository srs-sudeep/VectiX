import {
  Button,
  Checkbox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableShimmer,
  Transitions,
} from '@/components';

import { cn } from '@/lib/utils';
import { FilterConfig } from '@/types';
import { ArrowDownIcon, ArrowUpIcon, ChevronDown, ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type DynamicTableProps = {
  data: Record<string, any>[];
  customRender?: {
    [key: string]: (value: any, row: Record<string, any>) => React.ReactNode;
  };
  isLoading?: boolean;
  filterConfig?: FilterConfig[];
  className?: string;
  expandableRows?: boolean;
  expandedComponent?: (row: Record<string, any>) => React.ReactNode;
  disableSearch?: boolean;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  headerActions?: React.ReactNode;
  tableHeading?: string;
  rowExpandable?: (row: Record<string, any>) => boolean;
  filterMode?: 'local' | 'ui';
  onSearchChange?: (val: string) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  total?: number;
};

type SortDirection = 'asc' | 'desc' | null;

function toSentenceCase(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  customRender = {},
  isLoading = false,
  filterConfig = [],
  className = '',
  expandableRows = false,
  expandedComponent,
  disableSearch = false,
  onRowClick,
  headerActions,
  tableHeading,
  rowExpandable,
  filterMode = 'local',
  onSearchChange,
  page = 1,
  onPageChange,
  limit = 10,
  onLimitChange,
  total = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [localPage, setLocalPage] = useState(1);
  const [localLimit, setLocalLimit] = useState(10);
  const headers = data.length ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : [];
  const [totalRecords, setTotalRecords] = useState(total);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const clearFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const handleSearch = () => {
    if (filterMode === 'ui' && onSearchChange) {
      onSearchChange(searchTerm.trim() === '' ? '' : searchTerm);
    }
  };

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), 0, 1);
  const defaultTo = new Date(now.getFullYear(), 11, 31);
  const [tempRange, setTempRange] = useState<{ from: Date; to: Date }>(() => ({
    from: defaultFrom,
    to: defaultTo,
  }));

  const renderFilter = (filter: FilterConfig) => {
    const currentValue = filter.value !== undefined ? filter.value : columnFilters[filter.column];
    const onChange =
      filter.onChange ??
      ((val: any) => {
        setColumnFilters(prev => ({
          ...prev,
          [filter.column]: val,
        }));
      });

    switch (filter.type) {
      case 'multi-select': {
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        return (
          <Popover key={filter.column}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-border/50 bg-background hover:bg-accent gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="max-w-[100px] truncate">
                  {selectedValues.length > 0 ? `${selectedValues.length} selected` : filter.column}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 rounded-xl" align="start">
              <ScrollArea className="max-h-48">
                {filter.options?.map(opt => (
                  <div
                    key={opt}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      const exists = selectedValues.includes(opt);
                      onChange(exists ? selectedValues.filter((v: string) => v !== opt) : [...selectedValues, opt]);
                    }}
                  >
                    <Checkbox checked={selectedValues.includes(opt)} className="rounded" />
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
              </ScrollArea>
              {selectedValues.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-2 rounded-lg" onClick={() => onChange([])}>
                  Clear All
                </Button>
              )}
            </PopoverContent>
          </Popover>
        );
      }

      case 'dropdown': {
        return (
          <Popover key={filter.column}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-border/50 bg-background hover:bg-accent gap-2"
              >
                <span className="max-w-[100px] truncate">{currentValue || filter.column}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 rounded-xl" align="start">
              <ScrollArea className="max-h-48">
                {filter.options?.map(opt => (
                  <div
                    key={opt}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onChange(opt === currentValue ? undefined : opt)}
                  >
                    <Checkbox checked={currentValue === opt} className="rounded" />
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        );
      }

      case 'date':
        return (
          <div key={filter.column} className="relative">
            <DatePicker value={currentValue} onChange={val => onChange(val)} />
          </div>
        );

      case 'date-range': {
        return (
          <div key={filter.column} className="flex items-center gap-2">
            <DateRangePicker value={tempRange} onChange={setTempRange as any} className="h-10 rounded-xl" />
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={!tempRange.from || !tempRange.to}
              onClick={() => onChange(tempRange)}
            >
              Apply
            </Button>
          </div>
        );
      }

      case 'datetime':
        return (
          <div key={filter.column}>
            <DateTimePicker onChange={val => onChange(val)} />
          </div>
        );

      default:
        return null;
    }
  };

  const filteredData = useMemo(() => {
    if (filterMode === 'ui') {
      setTotalRecords(data.length);
      return data;
    }
    let result = data.filter(row => {
      let searchMatch = true;
      if (!disableSearch && searchTerm) {
        searchMatch = Object.values(row).some(val => {
          if (val == null) return false;
          if (Array.isArray(val)) {
            return val.some(item => String(item).toLowerCase().includes(searchTerm.toLowerCase()));
          }
          if (typeof val === 'object') {
            try {
              return JSON.stringify(val).toLowerCase().includes(searchTerm.toLowerCase());
            } catch {
              return false;
            }
          }
          return String(val).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      if (!disableSearch && searchTerm && !searchMatch) return false;

      for (const [col, val] of Object.entries(columnFilters)) {
        if (val === null || val === undefined || val === '') continue;
        if (Array.isArray(val) && val.length === 0) continue;
        if (typeof val === 'object' && !(val instanceof Date) && !Array.isArray(val)) {
          if (Object.keys(val).length === 0) continue;
        }
        const rowValue = row[col];

        if (val instanceof Date) {
          const rowDate = new Date(rowValue);
          if (isNaN(rowDate.getTime())) return false;
          const filterDate = new Date(val);
          filterDate.setHours(0, 0, 0, 0);
          const comparableRowDate = new Date(rowDate);
          comparableRowDate.setHours(0, 0, 0, 0);
          if (comparableRowDate.getTime() !== filterDate.getTime()) return false;
        } else if (val && typeof val === 'object' && (val.from || val.to)) {
          let rowDate: Date | null = null;
          if (rowValue instanceof Date) rowDate = rowValue;
          else if (typeof rowValue === 'string') rowDate = new Date(rowValue);
          if (!rowDate || isNaN(rowDate.getTime())) return false;

          if (val.from) {
            const startDate = new Date(val.from);
            startDate.setHours(0, 0, 0, 0);
            if (rowDate < startDate) return false;
          }
          if (val.to) {
            const endDate = new Date(val.to);
            endDate.setHours(23, 59, 59, 999);
            if (rowDate > endDate) return false;
          }
        } else if (Array.isArray(val)) {
          if (Array.isArray(rowValue)) {
            const hasMatch = val.some(selected =>
              rowValue.some(rv => String(rv.label).toLowerCase() === String(selected).toLowerCase())
            );
            if (!hasMatch) return false;
          } else {
            const hasMatch = val.some(selected => String(rowValue).toLowerCase() === String(selected).toLowerCase());
            if (!hasMatch) return false;
          }
        } else {
          if (!String(rowValue).toLowerCase().includes(String(val).toLowerCase())) return false;
        }
      }
      return true;
    });

    if (sortColumn && sortDirection) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
        if (bVal == null) return sortDirection === 'asc' ? 1 : -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    setTotalRecords(result.length);
    return result;
  }, [data, searchTerm, columnFilters, disableSearch, sortColumn, sortDirection, filterMode]);

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const paginatedData = useMemo(() => {
    if (filterMode === 'ui') return filteredData;
    const start = (localPage - 1) * localLimit;
    return filteredData.slice(start, start + localLimit);
  }, [filteredData, filterMode, localPage, localLimit]);

  const totalPages = Math.ceil((filterMode === 'ui' ? total || 0 : totalRecords) / (filterMode === 'ui' ? limit : localLimit));
  const currentPage = filterMode === 'ui' ? page : localPage;

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
        {/* Header Section */}
        {(tableHeading || headerActions || !disableSearch || filterConfig.length > 0) && (
          <div className="p-6 space-y-4">
            {/* Title and Actions Row */}
            {(tableHeading || headerActions) && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {tableHeading && (
                  <h2 className="text-xl font-semibold text-foreground">{toSentenceCase(tableHeading)}</h2>
                )}
                {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
              </div>
            )}

            {/* Search and Filters */}
            {(!disableSearch || filterConfig.length > 0) && (
              <div className="flex flex-col sm:flex-row gap-3">
                {!disableSearch && (
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        if (e.target.value.trim() === '') handleSearch();
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      onBlur={handleSearch}
                      className="pl-10 pr-10 h-10 rounded-xl border-border/50 bg-background"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          handleSearch();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                {filterConfig.length > 0 && (
                  <div className="flex flex-wrap gap-2">{filterConfig.map(renderFilter)}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Table Section */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <Transitions type="slide" direction="down" position="top" show={true}>
              <TableShimmer />
            </Transitions>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-y border-border/50">
                  {expandableRows && <TableHead className="w-12" />}
                  {headers.map(key => (
                    <TableHead
                      key={key}
                      className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        {sortColumn === key && (
                          sortDirection === 'asc' ? (
                            <ArrowUpIcon className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownIcon className="w-3.5 h-3.5" />
                          )
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length + (expandableRows ? 1 : 0)} className="py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium text-foreground mb-1">No data found</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          {searchTerm || Object.keys(columnFilters).length > 0
                            ? "Try adjusting your search or filters."
                            : "No records are currently available."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, i) => {
                    const canExpand = rowExpandable ? rowExpandable(row) : expandableRows;
                    const isExpanded = expandedRows[i] || false;

                    return (
                      <React.Fragment key={i}>
                        <TableRow
                          className={cn(
                            'border-b border-border/30 transition-colors',
                            'hover:bg-muted/20',
                            isExpanded && 'bg-muted/10',
                            onRowClick && 'cursor-pointer'
                          )}
                          onClick={() => onRowClick && onRowClick(row, i)}
                        >
                          {expandableRows && (
                            <TableCell
                              onClick={e => {
                                e.stopPropagation();
                                if (canExpand) toggleRow(i);
                              }}
                              className="px-4 py-4"
                            >
                              {canExpand && (
                                <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                                  <ChevronDown
                                    className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                                  />
                                </button>
                              )}
                            </TableCell>
                          )}
                          {headers.map(key => {
                            const value = row[key];
                            return (
                              <TableCell key={key} className="px-6 py-4 text-sm">
                                {customRender[key] ? (
                                  customRender[key](value, row)
                                ) : React.isValidElement(value) ? (
                                  value
                                ) : value instanceof Date ? (
                                  <span className="text-muted-foreground">{value.toLocaleString()}</span>
                                ) : typeof value === 'object' && value !== null ? (
                                  <code className="px-2 py-0.5 bg-muted rounded-md text-xs font-mono">
                                    {JSON.stringify(value)}
                                  </code>
                                ) : (
                                  <span>{String(value)}</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        {expandableRows && isExpanded && expandedComponent && canExpand && (
                          <TableRow>
                            <TableCell colSpan={headers.length + 1} className="p-0 bg-muted/5">
                              <div className="p-6">{expandedComponent(row)}</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-border/50">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Showing</span>
              <span className="font-medium text-foreground">{paginatedData.length}</span>
              <span>of</span>
              <span className="font-medium text-foreground">{totalRecords}</span>
              <span>results</span>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={String(filterMode === 'ui' ? limit : localLimit)}
                onValueChange={val => {
                  const newLimit = Number(val);
                  if (filterMode === 'ui' && onLimitChange) {
                    onLimitChange(newLimit);
                    if (onPageChange) onPageChange(1);
                  } else {
                    setLocalLimit(newLimit);
                    setLocalPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-20 h-9 rounded-xl border-border/50">
                  {String(filterMode === 'ui' ? limit : localLimit)}
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[5, 10, 20, 50, 100].map(opt => (
                    <SelectItem key={opt} value={String(opt)} className="rounded-lg">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    filterMode === 'ui' && onPageChange
                      ? onPageChange(Math.max(1, currentPage - 1))
                      : setLocalPage(Math.max(1, localPage - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {currentPage} / {totalPages || 1}
                </div>

                <button
                  onClick={() =>
                    filterMode === 'ui' && onPageChange
                      ? onPageChange(currentPage + 1)
                      : setLocalPage(localPage + 1)
                  }
                  disabled={currentPage >= totalPages}
                  className="w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
