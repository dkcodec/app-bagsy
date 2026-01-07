"use client";

import { ReactNode } from "react";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./index";

export interface DataTableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  render?: (value: any, item: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  // Данные
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  error?: string | null;

  // Заголовок и действия
  title: string;
  addButtonText: string;
  onAdd?: () => void;

  // Поиск
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Фильтры
  filters?: ReactNode;

  // Действия для строк
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  // Состояния
  emptyMessage: string;
  loadingMessage: string;
}

/**
 * Универсальная таблица данных с поиском, фильтрацией и действиями
 * Переиспользуемый компонент для любых типов данных
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  error,
  title,
  addButtonText,
  onAdd,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  onEdit,
  onDelete,
  emptyMessage,
  loadingMessage,
}: DataTableProps<T>) {
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {onAdd && (
            <Button onClick={onAdd} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>

        {/* Поиск и фильтры */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {filters && <div className="flex gap-2">{filters}</div>}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">{loadingMessage}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index} className={column.width}>
                      {column.title}
                    </TableHead>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableHead className="w-[100px] text-right">
                      Действия
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow key={index}>
                      {columns.map((column, colIndex) => {
                        const value =
                          typeof column.key === "string"
                            ? column.key
                                .split(".")
                                .reduce((obj, key) => obj?.[key], item)
                            : item[column.key];

                        return (
                          <TableCell key={colIndex} className={column.width}>
                            {column.render
                              ? column.render(value, item)
                              : String(value || "")}
                          </TableCell>
                        );
                      })}
                      {(onEdit || onDelete) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(item)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(item)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
