import Column from '@/components/column';
import { DraggedItemOverlay, Item, Position } from '@/components/item';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import {
    GestureHandlerRootView
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = 250;
const MAX_COLUMN_INDEX = 5;
const MAX_SCROLL_OFFSET = MAX_COLUMN_INDEX * COLUMN_WIDTH;





const App = () => {
    const scrollViewRef = useRef<Animated.ScrollView>(null);
    const [coluna1, setColuna1] = useState<Item[]>([
        { id: 1, nome: "Marília Gonçalves", produto: "Trilogia Russell Brunson", valor: 1997, prazo: "Em 7 dias", status: "em_dias", destaque: true },
        { id: 2, nome: "João da Silva Santos", produto: "English Speed Faster", valor: 2497, prazo: "Hoje", status: "hoje", destaque: false },
        { id: 3, nome: "Maria Clara Oliveira", produto: "Accelerate Your English Skills", valor: 797, prazo: "Há 3 dias", status: "atrasado", destaque: true },
        { id: 4, nome: "Joana Miranda", produto: "Accelerate Your English Skills", valor: 797, prazo: "Há 3 dias", status: "atrasado", destaque: true },
        { id: 5, nome: "João Silva", produto: "Accelerate Your English Skills", valor: 797, prazo: "Há 3 dias", status: "atrasado", destaque: true },
        { id: 6, nome: "Joana M", produto: "Accelerate Your English Skills", valor: 797, prazo: "Há 3 dias", status: "atrasado", destaque: true },
    ]);
    const [coluna2, setColuna2] = useState<Item[]>([
        { id: 16, nome: "Ana Luiza Mendes", produto: "Trilogia Russell Brunson", valor: 1997, prazo: "Hoje", status: "hoje", destaque: true },
        { id: 17, nome: "Gustavo Almeida", produto: "Boost Your English", valor: 497, prazo: "Há 3 dias", status: "atrasado", destaque: false },
    ]);
    const [coluna3, setColuna3] = useState<Item[]>([]);
    const [coluna4, setColuna4] = useState<Item[]>([]);
    const [coluna5, setColuna5] = useState<Item[]>([]);
    const [coluna6, setColuna6] = useState<Item[]>([]);

    const [draggedItem, setDraggedItem] = useState<Item | null>(null);
    const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });
    const [scrollOffset, setScrollOffset] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [autoScrollDirection, setAutoScrollDirection] = useState<'left' | 'right' | null>(null);
    const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(1);
    const [autoScrollTime, setAutoScrollTime] = useState<number>(0);
    const [currentColumnIndex, setCurrentColumnIndex] = useState<number>(-1);

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [sourceColuna, setSourceColuna] = useState<number>(-1);

    const [targetColumnIndex, setTargetColumnIndex] = useState<number>(-1);

    useEffect(() => {
        if (!isDragging || autoScrollDirection === null) return;

        const intervalId = setInterval(() => {
            setAutoScrollTime(prev => prev + 1.5);
        }, 80);

        const speedCalcInterval = setInterval(() => {
            const newSpeed = Math.min(1.5 + Math.pow(autoScrollTime * 0.45, 1.3), 18);
            setAutoScrollSpeed(newSpeed);
        }, 60);

        const scrollIntervalId = setInterval(() => {
            if (!scrollViewRef.current) return;

            const increment = Math.round(70 * autoScrollSpeed);

            if (autoScrollDirection === 'right') {
                const newOffset = Math.min(scrollOffset + increment, MAX_SCROLL_OFFSET);
                scrollViewRef.current.scrollTo({
                    x: newOffset,
                    y: 0,
                    animated: true
                });
                setScrollOffset(newOffset);
            } else if (autoScrollDirection === 'left') {
                const newOffset = Math.max(scrollOffset - increment, 0);
                scrollViewRef.current.scrollTo({
                    x: newOffset,
                    y: 0,
                    animated: true
                });
                setScrollOffset(newOffset);
            }
        }, 8);

        return () => {
            clearInterval(intervalId);
            clearInterval(speedCalcInterval);
            clearInterval(scrollIntervalId);
        };
    }, [isDragging, autoScrollDirection, scrollOffset, autoScrollSpeed, autoScrollTime]);

    const getColumnSetter = (index: number) => {
        switch (index) {
            case 0: return setColuna1;
            case 1: return setColuna2;
            case 2: return setColuna3;
            case 3: return setColuna4;
            case 4: return setColuna5;
            case 5: return setColuna6;
            default: return setColuna1;
        }
    };

    const getColumn = (index: number) => {
        switch (index) {
            case 0: return coluna1;
            case 1: return coluna2;
            case 2: return coluna3;
            case 3: return coluna4;
            case 4: return coluna5;
            case 5: return coluna6;
            default: return coluna1;
        }
    };

    const handleItemDrop = (item: Item, columnIndex: number, direction: 'left' | 'right') => {
        if (!item) return;

        let targetIndex = targetColumnIndex;

        if (targetIndex === -1) {
            const visibleColumns = Math.min(MAX_COLUMN_INDEX + 1, Math.floor(SCREEN_WIDTH / COLUMN_WIDTH));
            const scrollPosition = scrollOffset / COLUMN_WIDTH;

            if (direction === 'right') {
                const visibleEnd = Math.min(Math.floor(scrollPosition) + visibleColumns - 1, MAX_COLUMN_INDEX);
                targetIndex = Math.min(visibleEnd, columnIndex + 1);
                if (columnIndex === visibleEnd && columnIndex < MAX_COLUMN_INDEX) {
                    targetIndex = columnIndex + 1;
                    scrollTo(targetIndex - visibleColumns + 2);
                }
            } else if (direction === 'left') {
                const visibleStart = Math.max(Math.floor(scrollPosition), 0);
                targetIndex = Math.max(visibleStart, columnIndex - 1);
                if (columnIndex === visibleStart && columnIndex > 0) {
                    targetIndex = columnIndex - 1;
                    scrollTo(targetIndex);
                }
            }
        }

        setTargetColumnIndex(-1);

        if (targetIndex !== -1 && targetIndex !== columnIndex) {
            moverItem(item, columnIndex, targetIndex);
        } else {
            setSelectedItem(item);
            setSourceColuna(columnIndex);
        }
    };

    const moverItem = (item: Item, sourceIndex: number, targetIndex: number) => {
        if (sourceIndex === targetIndex) return;

        const sourceColumnSetter = getColumnSetter(sourceIndex);
        const targetColumnSetter = getColumnSetter(targetIndex);

        sourceColumnSetter((prev) => prev.filter((i) => i.id !== item.id));

        targetColumnSetter((prev) => [...prev, item]);
    };

    const scrollTo = (index: number) => {
        if (!scrollViewRef.current) return;
        const offset = index * COLUMN_WIDTH;
        scrollViewRef.current.scrollTo({ x: offset, y: 0, animated: true });
        setScrollOffset(offset);
    };

    const handleDragStart = (item: Item, absoluteX: number, absoluteY: number, columnIndex: number) => {
        setDraggedItem(item);
        setDragPosition({ x: absoluteX, y: absoluteY });
        setIsDragging(true);
        setAutoScrollTime(0);
        setAutoScrollSpeed(1);
        setCurrentColumnIndex(columnIndex);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setIsDragging(false);
        setAutoScrollDirection(null);
        setAutoScrollTime(0);
        setAutoScrollSpeed(1);
        setCurrentColumnIndex(-1);
        setTargetColumnIndex(-1);
    };

    const handleItemReorder = (item: Item, columnIndex: number, direction: 'up' | 'down') => {
        const column = getColumn(columnIndex);
        const columnSetter = getColumnSetter(columnIndex);
        const itemIndex = column.findIndex(i => i.id === item.id);

        if (itemIndex === -1) return;

        const newItems = [...column];

        if (direction === 'up' && itemIndex > 0) {
            // Mover para cima (troca com o item anterior)
            [newItems[itemIndex], newItems[itemIndex - 1]] = [newItems[itemIndex - 1], newItems[itemIndex]];
            columnSetter(newItems);
        } else if (direction === 'down' && itemIndex < column.length - 1) {
            // Mover para baixo (troca com o próximo item)
            [newItems[itemIndex], newItems[itemIndex + 1]] = [newItems[itemIndex + 1], newItems[itemIndex]];
            columnSetter(newItems);
        }
    };

    const handleDrag = (translationX: number, absoluteX: number, absoluteY: number, colunaIndex: number) => {
        setDragPosition({ x: absoluteX, y: absoluteY });

        if (!scrollViewRef.current) return;

        const estimatedColumnIndex = Math.floor((absoluteX + scrollOffset) / COLUMN_WIDTH);
        const validColumnIndex = Math.max(0, Math.min(estimatedColumnIndex, MAX_COLUMN_INDEX));

        if (validColumnIndex !== targetColumnIndex) {
            setTargetColumnIndex(validColumnIndex);
        }

        const screenMargin = 120;
        const scrollSensitivity = 0.8;

        if (absoluteX > SCREEN_WIDTH - screenMargin) {
            const distanceFromEdge = SCREEN_WIDTH - absoluteX;
            const speedFactor = Math.max(0.5, 1 - (distanceFromEdge / screenMargin) * scrollSensitivity);

            setAutoScrollDirection('right');
            setAutoScrollTime(prev => prev + speedFactor);
        } else if (absoluteX < screenMargin && scrollOffset > 0) {
            const distanceFromEdge = absoluteX;
            const speedFactor = Math.max(0.5, 1 - (distanceFromEdge / screenMargin) * scrollSensitivity);

            setAutoScrollDirection('left');
            setAutoScrollTime(prev => prev + speedFactor);
        } else {
            setAutoScrollDirection(null);
            setAutoScrollTime(0);
            setAutoScrollSpeed(1);
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setScrollOffset(event.nativeEvent.contentOffset.x);
    };

    const handleMomentumScrollEnd = () => {
    };

    const isColumnTarget = (index: number) => {
        return targetColumnIndex === index;
    };

    const colunasNomes = ['Aguardando Contato', 'Em Negociação', 'Próximo Contato', 'Fechamento', 'Ganhos', 'Perdidos'];

    return (
        <GestureHandlerRootView style={styles.root}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Recuperar vendas</Text>
                    <View style={styles.headerControls}>
                        <Ionicons name="reorder-three-outline" size={24} color="#fff" style={{ marginRight: 15 }} />
                        <Ionicons name="options-outline" size={24} color="#fff" style={{ marginRight: 15 }} />
                        <View style={styles.searchButton}>
                            <Ionicons name="search-outline" size={20} color="#fff" />
                        </View>
                    </View>
                </View>

                <DraggedItemOverlay
                    item={draggedItem}
                    position={dragPosition}
                />

                <Animated.ScrollView
                    ref={scrollViewRef}
                    horizontal
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    pointerEvents="box-none"
                    onScroll={handleScroll}
                    scrollEventThrottle={1}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    decelerationRate={0.994}
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="start"
                    removeClippedSubviews={false}
                    disableIntervalMomentum={true}
                    alwaysBounceHorizontal={false}
                >
                    <Column
                        title="Aguardando Contato"
                        icon="time-outline"
                        total="95  R$50.188,12 Total"
                        items={coluna1}
                        index={0}
                        onItemDrop={handleItemDrop}
                        onItemDrag={handleDrag}
                        onItemDragStart={handleDragStart}
                        onItemDragEnd={handleDragEnd}
                        onItemReorder={handleItemReorder}
                        isDragTarget={isColumnTarget(0)}
                    />
                    <Column
                        title="Em Negociação"
                        icon="chatbubble-outline"
                        total="45  R$22.188,12 Total"
                        items={coluna2}
                        index={1}
                        onItemDrop={handleItemDrop}
                        onItemDrag={handleDrag}
                        onItemDragStart={handleDragStart}
                        onItemDragEnd={handleDragEnd}
                        onItemReorder={handleItemReorder}
                        isDragTarget={isColumnTarget(1)}
                    />
                    <Column
                        title="Próximo Contato"
                        icon="calendar-outline"
                        total="18  R$12.488,00 Total"
                        items={coluna3}
                        index={2}
                        onItemDrop={handleItemDrop}
                        onItemDrag={handleDrag}
                        onItemDragStart={handleDragStart}
                        onItemDragEnd={handleDragEnd}
                        onItemReorder={handleItemReorder}
                        isDragTarget={isColumnTarget(2)}
                    />
                    <Column
                        title="Fechamento"
                        icon="trending-up-outline"
                        total="9  R$8.199,00 Total"
                        items={coluna4}
                        index={3}
                        onItemDrop={handleItemDrop}
                        onItemDrag={handleDrag}
                        onItemDragStart={handleDragStart}
                        onItemDragEnd={handleDragEnd}
                        onItemReorder={handleItemReorder}
                        isDragTarget={isColumnTarget(3)}
                    />
                    <Column
                        title="Ganhos"
                        icon="checkmark-circle-outline"
                        total="32  R$28.992,00 Total"
                        items={coluna5}
                        index={4}
                        onItemDrop={handleItemDrop}
                        onItemDrag={handleDrag}
                        onItemDragStart={handleDragStart}
                        onItemDragEnd={handleDragEnd}
                        onItemReorder={handleItemReorder}
                        isDragTarget={isColumnTarget(4)}
                    />
                    <Column
                        title="Perdidos"
                        icon="close-circle-outline"
                        total="21  R$16.788,00 Total"
                        items={coluna6}
                        index={5}
                        onItemDrop={handleItemDrop}
                        onItemDrag={handleDrag}
                        onItemDragStart={handleDragStart}
                        onItemDragEnd={handleDragEnd}
                        onItemReorder={handleItemReorder}
                        isDragTarget={isColumnTarget(5)}
                    />
                </Animated.ScrollView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#18181B',
    },
    container: {
        flex: 1,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollViewContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
        paddingTop: 5,
        minHeight: '100%',
    },
    scrollView: {
        flex: 1,
    },
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    modalContent: {
        width: 300,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#fff',
    },
    modalCancel: {
        marginTop: 15,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: 'bold',
    },

});

export default App;
