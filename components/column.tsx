import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import DraggableItem, { Item } from "./item";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLUMN_WIDTH = 250;
const COLUMN_HEIGHT = SCREEN_HEIGHT - 150; // Ajuste esse valor conforme necessário

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
    const scrollViewRef = useRef<ScrollView>(null);

    const handleItemDragStart = (item: Item, absX: number, absY: number) => {
        onItemDragStart(item, absX, absY, index);
    };

    const handleItemDrag = (tx: number, absX: number, absY: number) => {
        // Detectar quando o item está próximo às bordas da coluna para fazer auto-scroll
        const scrollMargin = 80;
        const relativeY = absY - 150; // Valor aproximado baseado no topo da tela

        if (scrollViewRef.current) {
            if (relativeY < scrollMargin) {
                // Auto-scroll para cima quando próximo ao topo
                scrollViewRef.current.scrollTo({
                    y: Math.max(0, relativeY - scrollMargin),
                    animated: true
                });
            } else if (relativeY > COLUMN_HEIGHT - scrollMargin) {
                // Auto-scroll para baixo quando próximo ao fundo
                scrollViewRef.current.scrollTo({
                    y: relativeY + scrollMargin - COLUMN_HEIGHT,
                    animated: true
                });
            }
        }

        onItemDrag(tx, absX, absY, index);
    };

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
            <ScrollView
                ref={scrollViewRef}
                style={styles.columnScroll}
                contentContainerStyle={styles.columnScrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.columnContent}>
                    {items.map((item) => (
                        <DraggableItem
                            key={item.id}
                            item={item}
                            onDrop={(direction) => onItemDrop(item, index, direction)}
                            onDrag={(tx, absX, absY) => handleItemDrag(tx, absX, absY)}
                            onDragStart={(item, absX, absY) => handleItemDragStart(item, absX, absY)}
                            onDragEnd={onItemDragEnd}
                            onReorder={onItemReorder ? (direction) => onItemReorder(item, index, direction) : undefined}
                        />
                    ))}
                </View>
            </ScrollView>
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
        paddingBottom: 0,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        overflow: 'hidden',
        height: COLUMN_HEIGHT, // Usa altura calculada baseada na tela
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
        paddingBottom: 10,
    },
    columnScroll: {
        flex: 1,
    },
    columnScrollContent: {
        paddingBottom: 20,
    },
})