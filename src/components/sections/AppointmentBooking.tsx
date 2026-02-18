"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const timeSlots = [
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Generate next 14 available days (excluding Sundays)
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  let count = 0;

  while (dates.length < 14) {
    const date = new Date(today);
    date.setDate(today.getDate() + count);

    // Exclude Sundays (0)
    if (date.getDay() !== 0) {
      dates.push({
        date: date,
        day: date.toLocaleDateString("es-AR", { weekday: "short" }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString("es-AR", { month: "short" }),
      });
    }
    count++;
  }

  return dates;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function MiniCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 60);
    return d;
  }, [today]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Adjust so Monday = 0
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(viewYear, viewMonth, d));
    }

    return days;
  }, [viewMonth, viewYear]);

  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();
  const canGoNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  const goToPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const isDateDisabled = (date: Date) => {
    if (date < today) return true;
    if (date > maxDate) return true;
    if (date.getDay() === 0) return true; // Sundays
    return false;
  };

  return (
    <div className="border border-[var(--border)] p-4 md:p-6 max-w-sm mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrev}
          disabled={!canGoPrev}
          className={cn(
            "p-1 transition-colors",
            canGoPrev ? "text-[var(--foreground)] hover:text-[var(--primary)]" : "text-gray-300 cursor-not-allowed"
          )}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-[var(--foreground)] capitalize">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={goToNext}
          disabled={!canGoNext}
          className={cn(
            "p-1 transition-colors",
            canGoNext ? "text-[var(--foreground)] hover:text-[var(--primary)]" : "text-gray-300 cursor-not-allowed"
          )}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} />;
          }

          const disabled = isDateDisabled(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              className={cn(
                "aspect-square flex items-center justify-center text-sm transition-all",
                disabled && "text-gray-300 cursor-not-allowed",
                !disabled && !isSelected && "hover:bg-[var(--muted)] text-[var(--foreground)]",
                isSelected && "bg-[var(--primary)] text-white",
                isToday && !isSelected && !disabled && "font-bold text-[var(--primary)]"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AppointmentBooking() {
  const [availableDates] = useState(generateAvailableDates());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) newErrors.date = "Seleccioná una fecha";
    if (!selectedTime) newErrors.time = "Seleccioná un horario";
    if (!formData.name.trim()) newErrors.name = "Ingresá tu nombre";
    if (!formData.email.trim()) {
      newErrors.email = "Ingresá tu email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Ingresá tu teléfono";
    } else if (formData.phone.replace(/\D/g, "").length < 8) {
      newErrors.phone = "El teléfono debe tener al menos 8 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setErrors((prev) => ({ ...prev, date: "" }));
  };

  if (submitted) {
    return (
      <section id="agenda" className="py-20 md:py-32 bg-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2
              className="text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              ¡Cita confirmada!
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              Te esperamos el{" "}
              <strong>
                {selectedDate &&
                  selectedDate.toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
              </strong>{" "}
              a las <strong>{selectedTime} hs</strong>
            </p>
            <p className="text-gray-500">
              Te enviamos un email con los detalles de tu reserva.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="agenda" className="py-20 md:py-32 bg-white">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
              Visitá Nuestro Showroom
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Agendá tu visita
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Reservá una cita para conocer nuestra colección en persona y
              recibir asesoramiento personalizado de nuestro equipo.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Date Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-[var(--primary)]" />
                  <h3 className="font-semibold text-[var(--foreground)]">
                    Seleccioná una fecha
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-sm text-[var(--primary)] hover:text-[var(--accent)] transition-colors font-medium"
                >
                  {showCalendar ? "Ver próximos días" : "Ver calendario"}
                </button>
              </div>

              {!showCalendar ? (
                /* Quick-select date buttons */
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  {availableDates.map((date) => (
                    <button
                      key={date.date.toISOString()}
                      type="button"
                      onClick={() => handleSelectDate(date.date)}
                      className={cn(
                        "flex-shrink-0 w-20 py-4 border text-center transition-all",
                        selectedDate && isSameDay(selectedDate, date.date)
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] hover:border-[var(--primary)]"
                      )}
                    >
                      <p className="text-xs uppercase opacity-70">{date.day}</p>
                      <p className="text-2xl font-semibold">{date.dayNum}</p>
                      <p className="text-xs uppercase opacity-70">{date.month}</p>
                    </button>
                  ))}
                </div>
              ) : (
                /* Calendar view */
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />
              )}

              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}

              {/* Show selected date feedback when in calendar mode */}
              {showCalendar && selectedDate && (
                <p className="text-center text-sm text-[var(--primary)] mt-3 font-medium">
                  Fecha seleccionada:{" "}
                  {selectedDate.toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-[var(--primary)]" />
                <h3 className="font-semibold text-[var(--foreground)]">
                  Seleccioná un horario
                </h3>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => { setSelectedTime(time); setErrors((prev) => ({ ...prev, time: "" })); }}
                    className={cn(
                      "py-3 border text-sm font-medium transition-all",
                      selectedTime === time
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>

            {/* Contact Info */}
            <div className="bg-[var(--muted)] p-6 md:p-8 mb-8">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                Tus datos de contacto
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  id="booking-name"
                  name="name"
                  label="Nombre completo"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                <Input
                  id="booking-phone"
                  name="phone"
                  type="tel"
                  label="Teléfono"
                  placeholder="+54 11 1234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
                <Input
                  id="booking-email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <div>
                  <label
                    htmlFor="booking-notes"
                    className="block text-sm font-medium text-[var(--foreground)] mb-2"
                  >
                    ¿Qué te gustaría ver? (opcional)
                  </label>
                  <input
                    id="booking-notes"
                    name="notes"
                    placeholder="Ej: Sofás, mesas de comedor..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--border)] bg-white focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? "Reservando..." : "Confirmar Reserva"}
              </Button>
              <p className="text-gray-500 text-sm mt-4">
                Recibirás un email de confirmación con los detalles de tu visita.
              </p>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
