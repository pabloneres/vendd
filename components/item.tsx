import { StyleSheet, Text, View } from "react-native";

import { GestureDetector } from "react-native-gesture-handler";

import { runOnJS, useAnimatedStyle } from "react-native-reanimated";

import { withSpring } from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

export interface Item {
    id: number;
    nome: string;
    produto?: string;
    valor?: number;
    prazo?: string;
    destaque?: boolean;
    status?: 'hoje' | 'atrasado' | 'em_dias' | 'aguardando';
}

export interface Position {
    x: number;
    y: number;
}

export interface DraggableItemProps {
    item: Item;
    onDrop: (direction: 'left' | 'right') => void; // Chamado quando o item é arrastado para esquerda ou direita
    onDrag: (tx: number, absX: number, absY: number) => void; // Chamado durante o arrasto
    onDragStart: (item: Item, absX: number, absY: number) => void; // Chamado quando o arrasto começa
    onDragEnd: () => void; // Chamado quando o arrasto termina
    onReorder?: (direction: 'up' | 'down') => void; // Chamado quando o item deve ser reordenado na mesma coluna
}

const DRAG_THRESHOLD = 100;
const VERTICAL_DRAG_THRESHOLD = 80;

export default function DraggableItem({ item, onDrop, onDrag, onDragStart, onDragEnd, onReorder }: DraggableItemProps) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const scale = useSharedValue(1);

    const longPressGesture = Gesture.LongPress()
        .minDuration(300)
        .onStart((event) => {
            isDragging.value = true;
            scale.value = withSpring(1.05);
            runOnJS(onDragStart)(item, event.absoluteX, event.absoluteY);
        });

    const panGesture = Gesture.Pan()
        .minDistance(0)
        .onUpdate((event) => {
            if (isDragging.value) {
                translateX.value = event.translationX;
                translateY.value = event.translationY;
                runOnJS(onDrag)(translateX.value, event.absoluteX, event.absoluteY);
            }
        })
        .onEnd((event) => {
            if (isDragging.value) {
                isDragging.value = false;
                scale.value = withSpring(1);
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);

                if (Math.abs(event.translationX) > DRAG_THRESHOLD) {
                    if (event.translationX > 0) {
                        runOnJS(onDrop)('right');
                    } else {
                        runOnJS(onDrop)('left');
                    }
                } else if (onReorder && Math.abs(event.translationY) > VERTICAL_DRAG_THRESHOLD) {
                    if (event.translationY > 0) {
                        runOnJS(onReorder)('down');
                    } else {
                        runOnJS(onReorder)('up');
                    }
                }

                runOnJS(onDragEnd)();
            }
        });

    const dragGesture = Gesture.Simultaneous(longPressGesture, panGesture);

    const style = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ],
            opacity: isDragging.value ? 0 : 1,
            borderLeftWidth: translateX.value > DRAG_THRESHOLD / 2 ? 3 : 0,
            borderRightWidth: translateX.value < -DRAG_THRESHOLD / 2 ? 3 : 0,
            borderTopWidth: translateY.value < -VERTICAL_DRAG_THRESHOLD / 2 ? 3 : 0,
            borderBottomWidth: translateY.value > VERTICAL_DRAG_THRESHOLD / 2 ? 3 : 0,
            borderLeftColor: '#4CAF50',
            borderRightColor: '#F44336',
            borderTopColor: '#2196F3',
            borderBottomColor: '#2196F3',
        };
    });

    return (
        <GestureDetector gesture={dragGesture}>
            <Animated.View style={[styles.card, style]}>
                <View style={styles.cardHeader}>
                    <View style={styles.userContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.nome.charAt(0)}</Text>
                        </View>
                        <Text style={styles.userName}>{item.nome}</Text>
                    </View>
                    {item.destaque && <Ionicons name="flame" size={22} color="#ff7b00" />}
                </View>

                <Text style={styles.productName}>{item.produto || 'Produto'}
                    {item.destaque && <Text style={styles.destaque}> +1</Text>}
                </Text>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.valorLabel}>Valor Total</Text>
                        <Text style={styles.valorPrice}>R${item.valor || 0}</Text>
                    </View>

                    {item.status && (
                        <View style={[
                            styles.statusBadge,
                            item.status === 'hoje' ? styles.statusHoje :
                                item.status === 'atrasado' ? styles.statusAtrasado :
                                    item.status === 'em_dias' ? styles.statusEmDias :
                                        styles.statusAguardando
                        ]}>
                            <Text style={styles.statusText}>
                                {item.status === 'hoje' ? 'Hoje' :
                                    item.status === 'atrasado' ? 'Há 3 dias' :
                                        item.status === 'em_dias' ? 'Em 7 dias' :
                                            'Aguardando'}
                            </Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        </GestureDetector>
    );
};

export const DraggedItemOverlay = ({ item, position }: { item: Item | null, position: Position }) => {
    if (!item) return null;

    return (
        <View
            style={[styles.dragOverlayContainer]}
            pointerEvents="none"
        >
            <View
                style={[
                    styles.dragOverlay,
                    {
                        left: position.x - 100,
                        top: position.y - 50,
                    }
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.userContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.nome.charAt(0)}</Text>
                        </View>
                        <Text style={styles.userName}>{item.nome}</Text>
                    </View>
                    {item.destaque && <Ionicons name="flame" size={22} color="#ff7b00" />}
                </View>

                <Text style={styles.productName}>{item.produto || 'Produto'}
                    {item.destaque && <Text style={styles.destaque}> +{Math.floor(Math.random() * 3) + 1}</Text>}
                </Text>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.valorLabel}>Valor Total</Text>
                        <Text style={styles.valorPrice}>R${item.valor || 0}</Text>
                    </View>

                    {item.status && (
                        <View style={[
                            styles.statusBadge,
                            item.status === 'hoje' ? styles.statusHoje :
                                item.status === 'atrasado' ? styles.statusAtrasado :
                                    item.status === 'em_dias' ? styles.statusEmDias :
                                        styles.statusAguardando
                        ]}>
                            <Text style={styles.statusText}>
                                {item.status === 'hoje' ? 'Hoje' :
                                    item.status === 'atrasado' ? 'Há 3 dias' :
                                        item.status === 'em_dias' ? 'Em 7 dias' :
                                            'Aguardando'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    dragOverlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 9999,
        pointerEvents: 'none',
    },
    dragOverlay: {
        position: 'absolute',
        width: 200,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 10,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    card: {
        backgroundColor: '#18181B',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        width: 235,
        marginHorizontal: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#555',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    productName: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 10,
    },
    destaque: {
        color: '#ff7b00',
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    valorLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 3,
    },
    valorPrice: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusHoje: {
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
    },
    statusAtrasado: {
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
    },
    statusEmDias: {
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
    },
    statusAguardando: {
        backgroundColor: 'rgba(108, 117, 125, 0.2)',
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
    },
})
