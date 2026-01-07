"use client";

import { ReactNode } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card as ChakraCard,
    SimpleGrid,
    Stat,
    Badge,
    Table,
    Button,
    Input,
    IconButton,
    Spinner,
    EmptyState,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FiSearch, FiInbox } from "react-icons/fi";

// ===== PAGE HEADER =====
interface PageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode; // For action buttons
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <HStack
            justify="space-between"
            align={{ base: "start", md: "center" }}
            flexDir={{ base: "column", md: "row" }}
            gap={4}
            mb={6}
        >
            <VStack align="start" gap={1}>
                <Heading
                    size={{ base: "lg", md: "xl" }}
                    className="page-title"
                    color="var(--foreground)"
                >
                    {title}
                </Heading>
                {description && (
                    <Text color="var(--sidebar-text-muted)" fontSize="sm">
                        {description}
                    </Text>
                )}
            </VStack>
            {children && (
                <HStack gap={2} flexWrap="wrap">
                    {children}
                </HStack>
            )}
        </HStack>
    );
}

// ===== STAT CARD =====
interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    colorScheme: "blue" | "green" | "orange" | "purple" | "red" | "teal" | "cyan" | "pink";
    helpText?: string;
}

const colorMap = {
    blue: { bg: "var(--stat-blue-bg)", color: "var(--stat-blue-color)" },
    green: { bg: "var(--stat-green-bg)", color: "var(--stat-green-color)" },
    orange: { bg: "var(--stat-orange-bg)", color: "var(--stat-orange-color)" },
    purple: { bg: "var(--stat-purple-bg)", color: "var(--stat-purple-color)" },
    red: { bg: "var(--stat-red-bg)", color: "var(--stat-red-color)" },
    teal: { bg: "var(--stat-teal-bg)", color: "var(--stat-teal-color)" },
    cyan: { bg: "var(--stat-cyan-bg)", color: "var(--stat-cyan-color)" },
    pink: { bg: "var(--stat-pink-bg)", color: "var(--stat-pink-color)" },
};

export function StatCard({ label, value, icon, colorScheme, helpText }: StatCardProps) {
    const colors = colorMap[colorScheme];

    return (
        <Card>
            <HStack gap={4}>
                <Box
                    p={3}
                    borderRadius="xl"
                    bg={colors.bg}
                    color={colors.color}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {icon}
                </Box>
                <Stat.Root>
                    <Stat.Label
                        color="var(--sidebar-text-muted)"
                        fontSize="sm"
                        fontWeight="medium"
                    >
                        {label}
                    </Stat.Label>
                    <Stat.ValueText
                        fontSize="2xl"
                        fontWeight="bold"
                        color="var(--foreground)"
                    >
                        {value}
                    </Stat.ValueText>
                    {helpText && (
                        <Stat.HelpText
                            mb={0}
                            fontSize="xs"
                            color="var(--sidebar-text-muted)"
                        >
                            {helpText}
                        </Stat.HelpText>
                    )}
                </Stat.Root>
            </HStack>
        </Card>
    );
}

// ===== STAT GRID =====
interface StatGridProps {
    children: ReactNode;
}

export function StatGrid({ children }: StatGridProps) {
    return (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
            {children}
        </SimpleGrid>
    );
}

// ===== CARD =====
interface CardProps {
    children: ReactNode;
    title?: string;
    description?: string;
    actions?: ReactNode;
    noPadding?: boolean;
}

export function Card({ children, title, description, actions, noPadding }: CardProps) {
    return (
        <Box
            bg="var(--card-bg)"
            borderRadius="xl"
            border="1px solid"
            borderColor="var(--card-border)"
            boxShadow="var(--card-shadow)"
            overflow="hidden"
            className="ui-card"
        >
            {(title || actions) && (
                <HStack
                    justify="space-between"
                    align="center"
                    px={5}
                    py={4}
                    borderBottom="1px solid"
                    borderColor="var(--card-border)"
                >
                    <VStack align="start" gap={0}>
                        {title && (
                            <Text fontWeight="semibold" color="var(--foreground)">
                                {title}
                            </Text>
                        )}
                        {description && (
                            <Text fontSize="sm" color="var(--sidebar-text-muted)">
                                {description}
                            </Text>
                        )}
                    </VStack>
                    {actions}
                </HStack>
            )}
            <Box p={noPadding ? 0 : 5}>{children}</Box>
        </Box>
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
        <HStack
            bg="var(--input-bg)"
            border="1px solid"
            borderColor="var(--input-border)"
            borderRadius="lg"
            px={3}
            py={2}
            gap={2}
            _focusWithin={{
                borderColor: "var(--input-focus-border)",
                boxShadow: "0 0 0 1px var(--input-focus-border)",
            }}
            transition="all 0.2s"
        >
            <FiSearch color="var(--sidebar-text-muted)" />
            <Input
                variant="flushed"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                color="var(--foreground)"
                border="none"
                _placeholder={{ color: "var(--sidebar-text-muted)" }}
            />
        </HStack>
    );
}

// ===== DATA TABLE =====
interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
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
            <Box py={12} textAlign="center">
                <Spinner size="lg" color="var(--active-color-admin)" />
                <Text mt={3} color="var(--sidebar-text-muted)">
                    Memuat data...
                </Text>
            </Box>
        );
    }

    if (data.length === 0) {
        return (
            <Box py={12} textAlign="center">
                <FiInbox size={48} color="var(--sidebar-text-muted)" style={{ margin: "0 auto" }} />
                <Text mt={3} color="var(--sidebar-text-muted)">
                    {emptyMessage}
                </Text>
            </Box>
        );
    }

    return (
        <Box overflowX="auto">
            <Table.Root size="sm" className="data-table">
                <Table.Header>
                    <Table.Row bg="var(--table-header-bg)">
                        {columns.map((col) => (
                            <Table.ColumnHeader
                                key={col.key}
                                color="var(--sidebar-text-muted)"
                                fontWeight="semibold"
                                fontSize="xs"
                                textTransform="uppercase"
                                letterSpacing="wider"
                                py={3}
                                px={4}
                                width={col.width}
                            >
                                {col.header}
                            </Table.ColumnHeader>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((item) => (
                        <Table.Row
                            key={keyExtractor(item)}
                            _hover={{ bg: "var(--table-row-hover)" }}
                            transition="background 0.15s"
                        >
                            {columns.map((col) => (
                                <Table.Cell
                                    key={col.key}
                                    py={3}
                                    px={4}
                                    color="var(--foreground)"
                                    fontSize="sm"
                                >
                                    {col.render
                                        ? col.render(item)
                                        : String((item as Record<string, unknown>)[col.key] ?? "-")}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
}

// ===== TABLE LOADING ROW =====
interface TableLoadingRowProps {
    colSpan: number;
    message?: string;
}

export function TableLoadingRow({ colSpan, message = "Memuat data..." }: TableLoadingRowProps) {
    return (
        <Table.Row>
            <Table.Cell colSpan={colSpan} textAlign="center" py={12}>
                <VStack gap={3}>
                    <Spinner
                        size="lg"
                        color="var(--active-color-admin)"
                        borderWidth="3px"
                    />
                    <Text
                        color="var(--sidebar-text-muted)"
                        fontSize="sm"
                        fontWeight="medium"
                    >
                        {message}
                    </Text>
                </VStack>
            </Table.Cell>
        </Table.Row>
    );
}

// ===== TABLE EMPTY ROW =====
interface TableEmptyRowProps {
    colSpan: number;
    icon?: ReactNode;
    message?: string;
    description?: string;
}

export function TableEmptyRow({
    colSpan,
    icon,
    message = "Tidak ada data",
    description,
}: TableEmptyRowProps) {
    return (
        <Table.Row>
            <Table.Cell colSpan={colSpan} textAlign="center" py={12}>
                <VStack gap={3}>
                    <Box color="var(--sidebar-text-muted)" opacity={0.5}>
                        {icon || <FiInbox size={48} />}
                    </Box>
                    <VStack gap={1}>
                        <Text
                            color="var(--sidebar-text-muted)"
                            fontSize="sm"
                            fontWeight="medium"
                        >
                            {message}
                        </Text>
                        {description && (
                            <Text
                                color="var(--sidebar-text-muted)"
                                fontSize="xs"
                                opacity={0.7}
                            >
                                {description}
                            </Text>
                        )}
                    </VStack>
                </VStack>
            </Table.Cell>
        </Table.Row>
    );
}

// ===== STATUS BADGE =====
interface StatusBadgeProps {
    status: string;
    colorScheme?: "green" | "red" | "orange" | "blue" | "gray" | "purple" | "teal";
}

export function StatusBadge({ status, colorScheme = "gray" }: StatusBadgeProps) {
    return (
        <Badge
            colorPalette={colorScheme}
            variant="subtle"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            fontWeight="medium"
        >
            {status}
        </Badge>
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

export function ActionButton({
    icon: Icon,
    label,
    onClick,
    colorScheme = "gray",
    variant = "ghost",
}: ActionButtonProps) {
    return (
        <IconButton
            aria-label={label}
            title={label}
            size="sm"
            variant={variant}
            colorPalette={colorScheme}
            onClick={onClick}
        >
            <Icon size={16} />
        </IconButton>
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
}

export function PrimaryButton({
    children,
    icon: Icon,
    onClick,
    colorScheme = "blue",
    isLoading,
    disabled,
    type = "button",
    size = "md",
}: PrimaryButtonProps) {
    return (
        <Button
            colorPalette={colorScheme}
            onClick={onClick}
            loading={isLoading}
            disabled={disabled}
            type={type}
            size={size}
            fontWeight="medium"
        >
            {Icon && <Icon size={18} />}
            {children}
        </Button>
    );
}

// ===== SECONDARY BUTTON =====
export function SecondaryButton({
    children,
    icon: Icon,
    onClick,
    colorScheme = "blue",
    isLoading,
    disabled,
    type = "button",
    size = "md",
}: PrimaryButtonProps) {
    return (
        <Button
            variant="outline"
            colorPalette={colorScheme}
            onClick={onClick}
            loading={isLoading}
            disabled={disabled}
            type={type}
            size={size}
            fontWeight="medium"
            borderColor="var(--card-border)"
            color="var(--foreground)"
            _hover={{ bg: "var(--sidebar-hover)" }}
        >
            {Icon && <Icon size={18} />}
            {children}
        </Button>
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
        <VStack align="stretch" gap={1.5}>
            <Text
                fontSize="sm"
                fontWeight="medium"
                color="var(--foreground)"
            >
                {label}
                {required && <Text as="span" color="var(--error)"> *</Text>}
            </Text>
            {children}
            {helperText && !error && (
                <Text fontSize="xs" color="var(--sidebar-text-muted)">
                    {helperText}
                </Text>
            )}
            {error && (
                <Text fontSize="xs" color="var(--error)">
                    {error}
                </Text>
            )}
        </VStack>
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
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            type={type}
            disabled={disabled}
            bg="var(--input-bg)"
            borderColor="var(--input-border)"
            color="var(--foreground)"
            _placeholder={{ color: "var(--sidebar-text-muted)" }}
            _hover={{ borderColor: "var(--sidebar-text-muted)" }}
            _focus={{
                borderColor: "var(--input-focus-border)",
                boxShadow: "0 0 0 1px var(--input-focus-border)",
            }}
            transition="all 0.2s"
        />
    );
}

// ===== LOADING OVERLAY =====
export function LoadingOverlay() {
    return (
        <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
        >
            <VStack
                bg="var(--card-bg)"
                p={6}
                borderRadius="xl"
                gap={3}
            >
                <Spinner size="lg" color="var(--active-color-admin)" />
                <Text color="var(--foreground)">Memuat...</Text>
            </VStack>
        </Box>
    );
}

// ===== LOADING CARD =====
interface LoadingCardProps {
    message?: string;
}

export function LoadingCard({ message = "Memuat data..." }: LoadingCardProps) {
    return (
        <Card>
            <VStack py={10} gap={3}>
                <Spinner
                    size="lg"
                    color="var(--active-color-admin)"
                    borderWidth="3px"
                />
                <Text
                    color="var(--sidebar-text-muted)"
                    fontSize="sm"
                    fontWeight="medium"
                >
                    {message}
                </Text>
            </VStack>
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
            <VStack py={10} gap={3}>
                <Box color="var(--sidebar-text-muted)" opacity={0.5}>
                    {icon || <FiInbox size={48} />}
                </Box>
                <VStack gap={1}>
                    <Text
                        color="var(--sidebar-text-muted)"
                        fontSize="sm"
                        fontWeight="medium"
                    >
                        {message}
                    </Text>
                    {description && (
                        <Text
                            color="var(--sidebar-text-muted)"
                            fontSize="xs"
                            opacity={0.7}
                        >
                            {description}
                        </Text>
                    )}
                </VStack>
                {action}
            </VStack>
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
        <VStack py={12} gap={4}>
            <Box color="var(--sidebar-text-muted)">
                <Icon size={64} />
            </Box>
            <VStack gap={1}>
                <Text fontWeight="semibold" color="var(--foreground)">
                    {title}
                </Text>
                {description && (
                    <Text fontSize="sm" color="var(--sidebar-text-muted)">
                        {description}
                    </Text>
                )}
            </VStack>
            {action}
        </VStack>
    );
}
