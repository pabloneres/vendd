import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import DraggableItem, { Item } from "./item";

export interface ColumnProps {
    title: string;
    icon: string;
    total: string;
    items: Item[];
    index: number;
    onItemDrop: (item: Item, columnIndex: number, direction: 'left' | 'right') => void;
    onItemDrag: (tx: number, absX: number, absY: number, columnIndex: number) => void;
    onItemDragStart: (item: Item, absX: number, absY: number, columnIndex: number) => void;
    onItemDragEnd: () => void;
    onItemReorder?: (item: Item, columnIndex: number, direction: 'up' | 'down') => void;
    isDragTarget: boolean;
}

const COLUMN_WIDTH = 250;

export default function Column({
    title,
    icon,
    total,
    items,
    index,
    onItemDrop,
    onItemDrag,
    onItemDragStart,
    onItemDragEnd,
    onItemReorder,
    isDragTarget
}: ColumnProps) {
    const [quantidade, valorTotal] = total.split('  ');

    return (
        <View
            style={[
                styles.column,
                isDragTarget && styles.columnDestino
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.columnHeader}>
                <View style={styles.columnIconContainer}>
                    <Ionicons name={icon as any} size={14} color="#AAA" />
                </View>
                <Text style={styles.columnTitle}>{title}</Text>
            </View>
            <View style={styles.columnTotalContainer}>
                <Text style={styles.columnQuantidade}>{quantidade}</Text>
                <Text style={styles.columnTotalValor}>{valorTotal}</Text>
            </View>
            <View style={styles.columnContent}>
                {items.map((item) => (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        onDrop={(direction) => onItemDrop(item, index, direction)}
                        onDrag={(tx, absX, absY) => onItemDrag(tx, absX, absY, index)}
                        onDragStart={(item, absX, absY) => onItemDragStart(item, absX, absY, index)}
                        onDragEnd={onItemDragEnd}
                        onReorder={onItemReorder ? (direction) => onItemReorder(item, index, direction) : undefined}
                    />
                ))}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    columnIconContainer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#444',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    columnQuantidade: {
        color: '#FFFFFF',
        fontWeight: '500',
        fontSize: 13,
        marginRight: 5,
    },
    columnTotalValor: {
        color: '#888',
        fontSize: 12,
    },
    columnDestino: {
        borderWidth: 2,
        borderColor: '#3498db',
        backgroundColor: '#1C2330',
        elevation: 8,
        shadowColor: "#3498db",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    column: {
        width: COLUMN_WIDTH,
        marginHorizontal: 5,
        paddingTop: 0,
        backgroundColor: '#27272A',
        borderRadius: 12,
        paddingHorizontal: 0,
        paddingBottom: 15,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#18181B',
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 0,
        borderBottomWidth: 0,
        borderBottomColor: '#333',
    },
    columnTitle: {
        marginLeft: 8,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    columnTotalContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#18181B',
        marginBottom: 10,
    },
    columnTotal: {
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    columnContent: {
        paddingHorizontal: 8,
    },
})