// src/components/ui/styles.ts
import { Dimensions, StyleSheet } from "react-native";
import { CORES } from '../../constants/cores';

const { width, height } = Dimensions.get("window");

export const global = StyleSheet.create({
    // ============================================
    // CONTAINERS PRINCIPAIS
    // ============================================
    safeArea: {
        flex: 1,
        backgroundColor: CORES.white
    },
    keyboardAvoiding: {
        flex: 1
    },
    container: {
        paddingHorizontal: width * 0.07,
        paddingTop: height * 0.07,
        paddingBottom: height * 0.09,
    },

    // ============================================
    // HEADER
    // ============================================
    header: {
        alignItems: "center",
        marginBottom: height * 0.03
    },
    title: {
        fontSize: 25,
        fontWeight: "800",
        color: CORES.primary,
    },
    subtitle: {
        fontSize: 17,
        color: CORES.primaryLight,
        marginTop: height * 0.01
    },

    // ============================================
    // CONTEÚDO PRINCIPAL
    // ============================================
    content: {
        backgroundColor: CORES.primarySoft,
        borderRadius: 10,
        padding: width * 0.02,
        shadowColor: CORES.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 5,
    },

    // ============================================
    // INPUTS E FORMULÁRIOS
    // ============================================
    inputGroup: {
        marginBottom: height * 0.02,
    },
    label: {
        fontSize: 17,
        fontWeight: "600",
        color: CORES.gray800,
        marginBottom: height * 0.01
    },
    inputIcon: {
        backgroundColor: CORES.white,
        borderWidth: 1,
        flexDirection: "row",
        borderColor: CORES.primary,
        borderRadius: 10,
        alignItems: "center",
        paddingLeft: width * 0.02
    },
    input: {
        flex: 1,
        fontSize: 17,
        color: CORES.gray900,
        fontWeight: "500",
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.015,
    },
    inputError: {
        backgroundColor: '#FEE2E2',
        borderColor: CORES.danger,
    },
    errorText: {
        color: CORES.danger,
        fontSize: 14,
        marginTop: height * 0.01,
    },

    // ============================================
    // ÍCONES ESPECIAIS
    // ============================================
    eyeIcon: {
        position: "absolute",
        right: 12,
        top: height * 0.045, // Ajustado para alinhar com o input
    },

    // ============================================
    // BOTÕES PRIMÁRIOS
    // ============================================
    primaryButton: {
        backgroundColor: CORES.primary,
        borderRadius: 10,
        padding: width * 0.025,
        alignItems: "center",
        minHeight: 50,
        justifyContent: "center",
    },
    primaryButtonDisabled: {
        backgroundColor: CORES.gray400,
        borderRadius: 10,
        opacity: 0.7,
    },
    primaryButtonText: {
        color: CORES.white,
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 1,
        textTransform: "uppercase",
    },

    // ============================================
    // BOTÕES SECUNDÁRIOS
    // ============================================
    secondaryButton: {
        backgroundColor: CORES.white,
        borderWidth: 1,
        borderColor: CORES.primary,
        borderRadius: 10,
        padding: width * 0.025,
        alignItems: "center",
        minHeight: 50,
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: CORES.primary,
        fontSize: 16,
        fontWeight: "600",
    },

    // ============================================
    // BOTÕES DE AÇÃO (SUCESSO, PERIGO, ETC)
    // ============================================
    successButton: {
        backgroundColor: CORES.success,
        borderRadius: 10,
        padding: width * 0.025,
        alignItems: "center",
    },
    successButtonText: {
        color: CORES.white,
        fontSize: 16,
        fontWeight: "600",
    },
    dangerButton: {
        backgroundColor: CORES.danger,
        borderRadius: 10,
        padding: width * 0.025,
        alignItems: "center",
    },
    dangerButtonText: {
        color: CORES.white,
        fontSize: 16,
        fontWeight: "600",
    },

    // ============================================
    // CARDS
    // ============================================
    card: {
        backgroundColor: CORES.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: CORES.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: CORES.gray200,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: CORES.primary,
    },
    cardSubtitle: {
        fontSize: 14,
        color: CORES.gray600,
    },

    // ============================================
    // BADGES (SITUAÇÕES)
    // ============================================
    badgeNoPrazo: {
        backgroundColor: CORES.badgeNoPrazo,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeNoPrazoText: {
        color: CORES.badgeNoPrazoText,
        fontSize: 10,
        fontWeight: "700",
    },
    badgeVenceHoje: {
        backgroundColor: CORES.badgeVenceHoje,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeVenceHojeText: {
        color: CORES.badgeVenceHojeText,
        fontSize: 10,
        fontWeight: "700",
    },
    badgeVencido: {
        backgroundColor: CORES.badgeVencido,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeVencidoText: {
        color: CORES.badgeVencidoText,
        fontSize: 10,
        fontWeight: "700",
    },
    badgeDevolvido: {
        backgroundColor: CORES.badgeDevolvido,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeDevolvidoText: {
        color: CORES.badgeDevolvidoText,
        fontSize: 10,
        fontWeight: "700",
    },
    badgeFinalizado: {
        backgroundColor: CORES.badgeFinalizado,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeFinalizadoText: {
        color: CORES.badgeFinalizadoText,
        fontSize: 10,
        fontWeight: "700",
    },

    // ============================================
    // LISTAS E ITENS DE LISTA
    // ============================================
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    listItem: {
        backgroundColor: CORES.white,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: CORES.gray200,
    },
    listItemSelected: {
        backgroundColor: CORES.primarySoft,
        borderColor: CORES.primary,
    },

    // ============================================
    // MODAL
    // ============================================
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: CORES.white,
        borderRadius: 16,
        width: '100%',
        maxWidth: 500,
        maxHeight: height * 0.8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: CORES.gray200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: CORES.primary,
    },
    modalBody: {
        padding: 16,
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: CORES.gray200,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },

    // ============================================
    // EMPTY STATE
    // ============================================
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        color: CORES.gray400,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: CORES.gray600,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: CORES.gray500,
        marginTop: 8,
        textAlign: 'center',
    },

    // ============================================
    // LOADING
    // ============================================
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: CORES.gray600,
        fontSize: 14,
    },

    // ============================================
    // SEPARADORES
    // ============================================
    separator: {
        height: 1,
        backgroundColor: CORES.gray200,
        marginVertical: 10,
    },

    // ============================================
    // ROW (LINHAS COM ÍCONES)
    // ============================================
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowIcon: {
        width: 24,
        alignItems: 'center',
    },
    rowLabel: {
        width: 70,
        fontSize: 14,
        color: CORES.gray600,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '500',
        color: CORES.gray900,
        flex: 1,
    },
});