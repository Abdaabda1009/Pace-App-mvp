import { StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");
const modalHeight = screenHeight * 0.65;

// Animation constants
const ANIMATION_DURATION = 350;
const DISMISS_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;
const MIN_DISTANCE_TO_TRIGGER = 5;

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOverlayTouch: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  handleIndicator: {
    flex: 1,
    alignItems: "center",
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scrollView: {
    flexGrow: 1,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  logoSection: {
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  yearlyPrice: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLabel: {
    fontSize: 15,
    color: "#64748B",
  },
  renewalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertIcon: {
    marginRight: 4,
  },
  renewalText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  urgentText: {
    fontWeight: "600",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#64748B",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailIcon: {
    width: 18,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
  capitalize: {
    textTransform: "capitalize",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  notesCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  notesInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#0F172A",
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  saveNotesButton: {
    backgroundColor: "#2F80ED",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-end",
    marginTop: 16,
    shadowColor: "#2F80ED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveIcon: {
    marginRight: 6,
  },
  saveNotesText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
    shadowColor: "#94A3B8",
  },
  savingNotesButton: {
    backgroundColor: "#2F80ED80",
  },
});

export const animationConstants = {
  ANIMATION_DURATION,
  DISMISS_THRESHOLD,
  VELOCITY_THRESHOLD,
  MIN_DISTANCE_TO_TRIGGER,
};
