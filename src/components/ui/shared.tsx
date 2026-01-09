"use client";

import { ReactNode } from "react";
import { IconType } from "react-icons";
import { FiSearch, FiInbox } from "react-icons/fi";

// ===== PAGE HEADER =====
interface PageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
                {description && (
                    <p className="text-sm text-gray-500">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex flex-wrap gap-2">
                    {children}
                </div>
            )}
        </div>
    );
}

// ===== STAT CARD =====
interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    colorScheme: "blue" | "green" | "orange" | "purple" | "red" | "teal" | "cyan" | "pink";
    helpText?: string;
    loading?: boolean;
}

const colorMap = {
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", color: "text-blue-600" },
    green: { bg: "bg-green-50", iconBg: "bg-green-100", color: "text-green-600" },
    orange: { bg: "bg-orange-50", iconBg: "bg-orange-100", color: "text-orange-600" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-100", color: "text-purple-600" },
    red: { bg: "bg-red-50", iconBg: "bg-red-100", color: "text-red-600" },
    teal: { bg: "bg-teal-50", iconBg: "bg-teal-100", color: "text-teal-600" },
    cyan: { bg: "bg-cyan-50", iconBg: "bg-cyan-100", color: "text-cyan-600" },
    pink: { bg: "bg-pink-50", iconBg: "bg-pink-100", color: "text-pink-600" },
};

export function StatCard({ label, value, icon, colorScheme, helpText, loading }: StatCardProps) {
    const colors = colorMap[colorScheme];

    return (
        <Card>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${colors.iconBg} ${colors.color} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    {loading ? (
                        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-2 mb-1" />
                    ) : (
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">
                            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
                        </h3>
                    )}
                    {helpText && (
                        <p className="text-xs text-gray-400">{helpText}</p>
                    )}
                </div>
            </div>
        </Card>
    );
}

// ===== STAT GRID =====
interface StatGridProps {
    children: ReactNode;
}

export function StatGrid({ children }: StatGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {children}
        </div>
    );
}

// ===== CARD =====
interface CardProps {
    children: ReactNode;
    title?: string;
    description?: string;
    actions?: ReactNode;
    noPadding?: boolean;
    className?: string;
}

export function Card({ children, title, description, actions, noPadding, className = "" }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            {(title || actions) && (
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                    <div className="flex flex-col">
                        {title && (
                            <span className="font-semibold text-gray-800">{title}</span>
                        )}
                        {description && (
                            <span className="text-sm text-gray-500">{description}</span>
                        )}
                    </div>
                    {actions}
                </div>
            )}
            <div className={noPadding ? "" : "p-5"}>{children}</div>
        </div>
    );
}

// ===== SEARCH INPUT =====
interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Cari..." }: SearchInputProps) {
    return (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#005DA6] focus-within:ring-1 focus-within:ring-[#005DA6] transition-all">
            <FiSearch className="w-4 h-4 text-gray-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
        </div>
    );
}

// ===== STATUS BADGE =====
interface StatusBadgeProps {
    status: string;
    colorScheme?: "green" | "red" | "orange" | "blue" | "gray" | "purple" | "teal";
}

const badgeColorMap = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-700",
    purple: "bg-purple-100 text-purple-700",
    teal: "bg-teal-100 text-teal-700",
};

export function StatusBadge({ status, colorScheme = "gray" }: StatusBadgeProps) {
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${badgeColorMap[colorScheme]}`}>
            {status}
        </span>
    );
}

// ===== ACTION BUTTON =====
interface ActionButtonProps {
    icon: IconType;
    label: string;
    onClick: () => void;
    colorScheme?: "blue" | "red" | "green" | "orange" | "gray";
    variant?: "ghost" | "outline" | "solid";
}

const actionButtonColors = {
    blue: { ghost: "text-blue-600 hover:bg-blue-50", outline: "border-blue-600 text-blue-600 hover:bg-blue-50", solid: "bg-blue-600 text-white hover:bg-blue-700" },
    red: { ghost: "text-red-600 hover:bg-red-50", outline: "border-red-600 text-red-600 hover:bg-red-50", solid: "bg-red-600 text-white hover:bg-red-700" },
    green: { ghost: "text-green-600 hover:bg-green-50", outline: "border-green-600 text-green-600 hover:bg-green-50", solid: "bg-green-600 text-white hover:bg-green-700" },
    orange: { ghost: "text-orange-600 hover:bg-orange-50", outline: "border-orange-600 text-orange-600 hover:bg-orange-50", solid: "bg-orange-600 text-white hover:bg-orange-700" },
    gray: { ghost: "text-gray-600 hover:bg-gray-100", outline: "border-gray-300 text-gray-600 hover:bg-gray-50", solid: "bg-gray-600 text-white hover:bg-gray-700" },
};

export function ActionButton({
    icon: Icon,
    label,
    onClick,
    colorScheme = "gray",
    variant = "ghost",
}: ActionButtonProps) {
    const baseClasses = "p-2 rounded-lg transition-colors";
    const colorClasses = actionButtonColors[colorScheme][variant];
    const borderClass = variant === "outline" ? "border" : "";

    return (
        <button
            aria-label={label}
            title={label}
            onClick={onClick}
            className={`${baseClasses} ${colorClasses} ${borderClass}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}

// ===== PRIMARY BUTTON =====
interface PrimaryButtonProps {
    children: ReactNode;
    icon?: IconType;
    onClick?: () => void;
    colorScheme?: "blue" | "green" | "red" | "orange";
    isLoading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit";
    size?: "sm" | "md" | "lg";
    className?: string;
}

const primaryButtonColors = {
    blue: "bg-[#005DA6] hover:bg-[#00457C]",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    orange: "bg-orange-600 hover:bg-orange-700",
};

const primaryButtonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
};

export function PrimaryButton({
    children,
    icon: Icon,
    onClick,
    colorScheme = "blue",
    isLoading,
    disabled,
    type = "button",
    size = "md",
    className = "",
}: PrimaryButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
                inline-flex items-center justify-center gap-2 font-medium text-white rounded-lg
                transition-colors shadow-sm
                ${primaryButtonColors[colorScheme]}
                ${primaryButtonSizes[size]}
                ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
        >
            {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
        </button>
    );
}

// ===== SECONDARY BUTTON =====
export function SecondaryButton({
    children,
    icon: Icon,
    onClick,
    isLoading,
    disabled,
    type = "button",
    size = "md",
    className = "",
}: PrimaryButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
                inline-flex items-center justify-center gap-2 font-medium text-gray-700 rounded-lg
                border border-gray-300 bg-white hover:bg-gray-50 transition-colors
                ${primaryButtonSizes[size]}
                ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
        >
            {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
        </button>
    );
}

// ===== FORM FIELD =====
interface FormFieldProps {
    label: string;
    children: ReactNode;
    required?: boolean;
    helperText?: string;
    error?: string;
}

export function FormField({ label, children, required, helperText, error }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {helperText && !error && (
                <p className="text-xs text-gray-500">{helperText}</p>
            )}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

// ===== STYLED INPUT =====
interface StyledInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
}

export function StyledInput({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled,
}: StyledInputProps) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`
                w-full px-3 py-2.5 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent
                text-sm text-gray-700 placeholder:text-gray-400
                transition-all
                ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            `}
        />
    );
}

// ===== LOADING OVERLAY =====
export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700">Memuat...</span>
            </div>
        </div>
    );
}

// ===== LOADING CARD =====
interface LoadingCardProps {
    message?: string;
}

export function LoadingCard({ message = "Memuat data..." }: LoadingCardProps) {
    return (
        <Card>
            <div className="py-10 flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium text-gray-500">{message}</span>
            </div>
        </Card>
    );
}

// ===== EMPTY CARD =====
interface EmptyCardProps {
    icon?: ReactNode;
    message: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyCard({ icon, message, description, action }: EmptyCardProps) {
    return (
        <Card>
            <div className="py-10 flex flex-col items-center gap-3">
                <div className="text-gray-400 opacity-50">
                    {icon || <FiInbox className="w-12 h-12" />}
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">{message}</p>
                    {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    )}
                </div>
                {action}
            </div>
        </Card>
    );
}

// ===== EMPTY STATE =====
interface EmptyStateBoxProps {
    icon?: IconType;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyStateBox({ icon: Icon = FiInbox, title, description, action }: EmptyStateBoxProps) {
    return (
        <div className="py-12 flex flex-col items-center gap-4">
            <div className="text-gray-400">
                <Icon className="w-16 h-16" />
            </div>
            <div className="text-center">
                <p className="font-semibold text-gray-700">{title}</p>
                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}

// ===== MODAL COMPONENT =====
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

const modalSizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
};

export function Modal({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative bg-white rounded-xl shadow-2xl w-full ${modalSizes[size]} mx-4 max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-4">
                    {children}
                </div>
                {footer && (
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== TABLE COMPONENTS =====
interface DataTableProps<T> {
    columns: { key: string; header: string; render?: (item: T) => ReactNode; width?: string; align?: "left" | "center" | "right" }[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    keyExtractor: (item: T) => string;
}

export function DataTable<T>({
    columns,
    data,
    loading,
    emptyMessage = "Tidak ada data",
    keyExtractor,
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memuat data...</span>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="py-12 text-center">
                <FiInbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`
                                    px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider
                                    ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
                                `}
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item, index) => (
                        <tr
                            key={keyExtractor(item)}
                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={`
                                        px-4 py-3 text-sm text-gray-700
                                        ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
                                    `}
                                >
                                    {col.render
                                        ? col.render(item)
                                        : String((item as Record<string, unknown>)[col.key] ?? "-")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ===== SKELETON =====
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
    return (
        <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
    );
}
