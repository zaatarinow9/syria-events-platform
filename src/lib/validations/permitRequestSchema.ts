import { z } from "zod";
import { GOVERNORATES } from "../constants/governorates";
import { EVENT_TYPES } from "../constants/eventTypes";

export const permitRequestSchema = z.object({
  fullName: z.string().min(3, "الاسم الكامل مطلوب (3 أحرف على الأقل)"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  phone: z.string().min(9, "رقم الهاتف غير صالح"),
  organizationName: z.string().optional(),
  submitterRole: z.string().min(2, "صفتك في التنظيم مطلوبة"),

  eventTitle: z.string().min(3, "عنوان الفعالية مطلوب"),
  eventType: z.enum(EVENT_TYPES, {
    error: "يرجى اختيار نوع الفعالية",
  }),
  governorate: z.enum(GOVERNORATES, {
    error: "يرجى اختيار المحافظة",
  }),

  city: z.string().min(2, "المدينة / المنطقة مطلوبة"),
  location: z.string().min(5, "مكان التجمع الدقيق مطلوب"),
  route: z.string().optional(),
  eventDate: z.string().min(1, "تاريخ الفعالية مطلوب"),

  expectedAttendees: z
    .number({
      error: "العدد المتوقع مطلوب",
    })
    .min(1, "العدد المتوقع مطلوب"),

  startTime: z.string().min(1, "وقت البداية مطلوب"),
  endTime: z.string().min(1, "وقت النهاية مطلوب"),
  eventGoal: z.string().min(20, "يجب أن يكون الهدف 20 حرفاً على الأقل"),

  committeeHeadName: z.string().min(3, "اسم رئيس اللجنة مطلوب"),
  committeeHeadPhone: z.string().min(9, "رقم هاتف رئيس اللجنة مطلوب"),
  committeeHeadEmail: z.string().email("بريد إلكتروني غير صالح"),

  member1Name: z.string().min(3, "اسم العضو الأول مطلوب"),
  member1Phone: z.string().optional(),

  member2Name: z.string().min(3, "اسم العضو الثاني مطلوب"),
  member2Phone: z.string().optional(),

  pledgeTrueInfo: z.literal(true, {
    error: "يجب الموافقة على هذا التعهد",
  }),
  pledgePeaceful: z.literal(true, {
    error: "يجب الموافقة على هذا التعهد",
  }),
  pledgeCommitment: z.literal(true, {
    error: "يجب الموافقة على هذا التعهد",
  }),
  pledgeNoMisleading: z.literal(true, {
    error: "يجب الموافقة على هذا التعهد",
  }),
  pledgeAcknowledgment: z.literal(true, {
    error: "يجب الموافقة على هذا الإقرار",
  }),
});

export type PermitRequestFormValues = z.infer<typeof permitRequestSchema>;

export type PledgeFieldName =
  | "pledgeTrueInfo"
  | "pledgePeaceful"
  | "pledgeCommitment"
  | "pledgeNoMisleading"
  | "pledgeAcknowledgment";