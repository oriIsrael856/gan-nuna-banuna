import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../src/components/AppButton";
import { AppCard } from "../src/components/AppCard";
import { AppHeader } from "../src/components/AppHeader";
import { AppScreen } from "../src/components/AppScreen";
import { AppStateCard } from "../src/components/AppStateCard";
import { AppTextInput } from "../src/components/AppTextInput";
import { BottomNavBar } from "../src/components/BottomNavBar";
import type { CalendarEvent, CalendarEventType } from "../src/data/mockCalendar";
import { useAsyncData } from "../src/hooks/useAsyncData";
import { useBottomNavPress } from "../src/navigation/useBottomNavPress";
import { getCurrentUserRole } from "../src/services/auth.service";
import {
  addCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from "../src/services/calendar.service";
import {
  buildMonthCells,
  formatMonthTitle,
  formatSelectedDayLabel,
  toDateIso,
  WEEKDAY_LABELS,
} from "../src/utils/calendarMonth";
import { confirmDelete } from "../src/utils/confirm";
import { Colors } from "../src/theme/colors";
import { BorderRadius, Spacing } from "../src/theme/spacing";
import { todayIso } from "../src/services/mappers";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TYPE_META: Record<string, { label: string; icon: IoniconName }> = {
  trip: { label: "טיול", icon: "bus-outline" },
  event: { label: "אירוע", icon: "sparkles-outline" },
  meeting: { label: "פגישה", icon: "people-outline" },
  holiday: { label: "חופש", icon: "sunny-outline" },
};

const TYPE_OPTIONS: { id: CalendarEventType; label: string }[] = [
  { id: "event", label: "אירוע" },
  { id: "trip", label: "טיול" },
  { id: "meeting", label: "פגישה" },
  { id: "holiday", label: "חופש" },
];

export default function CalendarScreen() {
  const router = useRouter();
  const role = getCurrentUserRole();
  const isTeacher = role === "teacher";
  const variant = isTeacher ? "teacher" : "parent";
  const handleBottomNavPress = useBottomNavPress(variant);
  const { data, loading, error, reload } = useAsyncData(() => getCalendarEvents(), []);
  const events = data ?? [];

  const today = todayIso();
  const initialMonth = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<CalendarEventType>("event");

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      if (!event.dateIso) {
        continue;
      }
      const list = map.get(event.dateIso) ?? [];
      list.push(event);
      map.set(event.dateIso, list);
    }
    return map;
  }, [events]);

  const monthCells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const selectedDayEvents = selectedDateIso ? (eventsByDate.get(selectedDateIso) ?? []) : [];

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function handleDayPress(day: number) {
    const iso = toDateIso(viewYear, viewMonth, day);
    setSelectedDateIso(iso);
  }

  function handleDelete(id: string) {
    confirmDelete("למחוק את האירוע?", async () => {
      await deleteCalendarEvent(id);
      reload();
    });
  }

  function openCreate(prefillDate?: string) {
    setEditingId(null);
    setNewTitle("");
    setNewDate(prefillDate ?? "");
    setNewTime("");
    setNewType("event");
    setComposerOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setEditingId(event.id);
    setNewTitle(event.title);
    setNewDate(event.dateIso ?? "");
    setNewTime(event.time);
    setNewType(event.type);
    setComposerOpen(true);
  }

  async function handleSave() {
    if (!newTitle.trim() || !newDate.trim()) {
      return;
    }
    setSaving(true);
    if (editingId) {
      await updateCalendarEvent(editingId, {
        title: newTitle.trim(),
        eventDate: newDate.trim(),
        eventTime: newTime.trim() || undefined,
        type: newType,
      });
    } else {
      await addCalendarEvent({
        title: newTitle.trim(),
        eventDate: newDate.trim(),
        eventTime: newTime.trim() || undefined,
        type: newType,
      });
    }
    setSaving(false);
    setComposerOpen(false);
    setEditingId(null);
    setNewTitle("");
    setNewDate("");
    setNewTime("");
    setNewType("event");
    reload();
  }

  function renderEventCard(event: CalendarEvent) {
    const meta = TYPE_META[event.type] ?? TYPE_META.event;

    return (
      <Pressable
        key={event.id}
        onLongPress={isTeacher ? () => handleDelete(event.id) : undefined}
      >
        <AppCard style={styles.eventCard}>
          {isTeacher ? (
            <TouchableOpacity
              hitSlop={8}
              onPress={() => openEdit(event)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>{event.day}</Text>
            <Text style={styles.dateMonth}>{event.month}</Text>
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventMetaRow}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.eventTime}>{event.time || "כל היום"}</Text>
            </View>
          </View>

          <View style={styles.typeChip}>
            <Ionicons name={meta.icon} size={14} color={Colors.primary} />
            <Text style={styles.typeText}>{meta.label}</Text>
          </View>
        </AppCard>
      </Pressable>
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          onBellPress={() => router.push("/notifications")}
          onLeadingPress={() => {}}
        />
        <Text style={styles.title}>לוח שנה</Text>
        <Text style={styles.subtitle}>אירועים, טיולים ומפגשים קרובים</Text>

        {isTeacher ? (
          <TouchableOpacity activeOpacity={0.85} style={styles.newButton} onPress={() => openCreate()}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.newButtonText}>הוספת אירוע</Text>
          </TouchableOpacity>
        ) : null}

        {loading ? (
          <AppStateCard state="loading" title="טוען לוח שנה" message="רגע, טוענים את האירועים" />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת האירועים. נסו שוב."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : (
          <>
            <AppCard style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <TouchableOpacity
                  hitSlop={12}
                  onPress={() => shiftMonth(1)}
                  style={styles.monthNavButton}
                >
                  <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
                </TouchableOpacity>

                <Text style={styles.monthTitle}>{formatMonthTitle(viewYear, viewMonth)}</Text>

                <TouchableOpacity
                  hitSlop={12}
                  onPress={() => shiftMonth(-1)}
                  style={styles.monthNavButton}
                >
                  <Ionicons name="chevron-back" size={22} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((label) => (
                  <Text key={label} style={styles.weekdayLabel}>
                    {label}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {monthCells.map((day, index) => {
                  if (day === null) {
                    return <View key={`empty-${index}`} style={styles.dayCell} />;
                  }

                  const dateIso = toDateIso(viewYear, viewMonth, day);
                  const hasEvents = eventsByDate.has(dateIso);
                  const isSelected = selectedDateIso === dateIso;
                  const isToday = dateIso === today;

                  return (
                    <TouchableOpacity
                      key={dateIso}
                      activeOpacity={0.75}
                      onPress={() => handleDayPress(day)}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          isSelected && styles.dayNumberSelected,
                          isToday && !isSelected && styles.dayNumberToday,
                        ]}
                      >
                        {day}
                      </Text>
                      {hasEvents ? (
                        <View
                          style={[
                            styles.eventDot,
                            isSelected && styles.eventDotSelected,
                          ]}
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </AppCard>

            {selectedDateIso ? (
              <View style={styles.dayEventsSection}>
                <Text style={styles.dayEventsTitle}>
                  {formatSelectedDayLabel(selectedDateIso)}
                </Text>

                {selectedDayEvents.length === 0 ? (
                  <AppStateCard
                    state="empty"
                    title="אין אירועים ביום זה"
                    message={
                      isTeacher
                        ? "ניתן להוסיף אירוע חדש ליום שנבחר."
                        : "אין אירועים מתוכננים ליום שנבחר."
                    }
                    actionLabel={isTeacher ? "הוספת אירוע" : undefined}
                    onActionPress={
                      isTeacher ? () => openCreate(selectedDateIso) : undefined
                    }
                  />
                ) : (
                  <View style={styles.list}>{selectedDayEvents.map(renderEventCard)}</View>
                )}
              </View>
            ) : (
              <AppStateCard
                state="empty"
                title="בחרו יום בלוח"
                message="ימים עם נקודה ירוקה מסמנים אירועים. לחצו על יום כדי לראות את האירועים שלו."
              />
            )}
          </>
        )}
      </AppScreen>

      <Modal
        visible={composerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setComposerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setComposerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editingId ? "עריכת אירוע" : "אירוע חדש"}</Text>
            <AppTextInput label="כותרת" value={newTitle} onChangeText={setNewTitle} placeholder="לדוגמה: טיול שנתי" />
            <AppTextInput label="תאריך" value={newDate} onChangeText={setNewDate} placeholder="2026-06-20" />
            <AppTextInput label="שעה" value={newTime} onChangeText={setNewTime} placeholder="10:00" />

            <Text style={styles.modalLabel}>סוג</Text>
            <View style={styles.typeRow}>
              {TYPE_OPTIONS.map((option) => {
                const selected = newType === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.8}
                    onPress={() => setNewType(option.id)}
                    style={[styles.typeOption, selected && styles.typeOptionSelected]}
                  >
                    <Text style={[styles.typeOptionText, selected && styles.typeOptionTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton
              title={saving ? "שומר..." : editingId ? "עדכון" : "הוספה"}
              onPress={handleSave}
              disabled={saving}
              style={styles.modalSave}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalCancel}
              onPress={() => setComposerOpen(false)}
            >
              <Text style={styles.modalCancelText}>ביטול</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNavBar activeItem="calendar" variant={variant} onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  newButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  newButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  monthCard: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  monthHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthNavButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  weekdayRow: {
    flexDirection: "row-reverse",
    marginTop: Spacing.xs,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  daysGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    paddingVertical: 4,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    backgroundColor: Colors.secondary,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  dayNumberSelected: {
    color: Colors.white,
  },
  dayNumberToday: {
    color: Colors.primary,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  eventDotSelected: {
    backgroundColor: Colors.white,
  },
  dayEventsSection: {
    marginTop: Spacing.lg,
  },
  dayEventsTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: Spacing.sm,
  },
  list: {
    gap: Spacing.sm,
  },
  eventCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: Spacing.xs,
    left: Spacing.xs,
    zIndex: 1,
  },
  dateBox: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
  },
  dateMonth: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "700",
  },
  eventInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  eventMetaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  eventTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  typeChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  typeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  typeRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  typeOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "#E8DDD2",
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  typeOptionTextSelected: {
    color: Colors.white,
  },
  modalSave: {
    marginTop: Spacing.sm,
  },
  modalCancel: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textSecondary,
  },
});
