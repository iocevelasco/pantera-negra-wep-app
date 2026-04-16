import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@pantera-negra/shared";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, UserRole } from "@pantera-negra/shared";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useTenants } from "@/hooks/tenants/use-tenants";
import { membershipsApi } from "@/api/memberships";
import type { MembershipPlan } from "@pantera-negra/shared";
import { PasswordGenerator } from "@/components/ui/password-generator";
import { QueryKeys } from "@/lib/query-keys";

// Schema for create mode
const createUserSchema = userSchema.extend({
  email_verified: z.boolean().optional(),
  memberType: z.enum(['Adult', 'Kid']).optional(),
  plan: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative').optional().nullable(),
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// Schema for edit mode
const editUserSchema = userSchema.partial().extend({
  email: z.string().email('Invalid email format').optional(),
  memberType: z.enum(['Adult', 'Kid']).optional(),
  plan: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative').optional().nullable(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

interface UserFormProps {
  onSubmit: (data: Omit<User, "id" | "created_at" | "updated_at" | "email_verified"> & { email_verified?: boolean; memberType?: 'Adult' | 'Kid'; plan?: string; price?: number; picture?: string; temporaryPassword?: string }) => void;
  onCancel: () => void;
  defaultValues?: Partial<UserFormValues & { memberType?: 'Adult' | 'Kid'; plan?: string; price?: number; picture?: string; temporaryPassword?: string; role?: UserRole }>; // role kept for backward compatibility
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function MemberForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  mode = "create",
}: UserFormProps) {
  const { t } = useTranslation();

  // Fetch tenants and memberships for dropdowns
  const tenants = useTenants();

  const { data: plans = [] } = useQuery<MembershipPlan[]>({
    queryKey: [QueryKeys.membershipPlans],
    queryFn: () => membershipsApi.getPlans(),
  });

  const schema = mode === "create" ? createUserSchema : editUserSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultValues?.email || "",
      name: defaultValues?.name || "",
      roles: defaultValues?.roles || ((defaultValues as any)?.role ? [(defaultValues as any).role as UserRole] : ["student"]),
      tenant_id: defaultValues?.tenant_id || "",
      membership_id: defaultValues?.membership_id || "",
      rank: (defaultValues?.rank || "White") as User['rank'],
      stripes: defaultValues?.stripes || 0,
      memberType: (defaultValues?.memberType || (defaultValues?.membership_id ? undefined : "Adult")) as 'Adult' | 'Kid' | undefined,
      plan: defaultValues?.plan || "",
      price: defaultValues?.price || undefined,
      temporaryPassword: defaultValues?.temporaryPassword || "",
    },
  });

  // Set default tenant_id if not provided and tenants are available
  useEffect(() => {
    if (tenants.length > 0 && !form.getValues('tenant_id')) {
      form.setValue('tenant_id', tenants[0].id);
    }
  }, [tenants, form]);

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        email: defaultValues.email || "",
        name: defaultValues.name || "",
        roles: defaultValues.roles || (defaultValues.role ? [defaultValues.role as UserRole] : ["student"]),
        tenant_id: defaultValues.tenant_id || "",
        membership_id: defaultValues.membership_id || "",
        rank: (defaultValues.rank || "White") as User['rank'],
        stripes: defaultValues.stripes || 0,
        memberType: (defaultValues.memberType || "Adult") as 'Adult' | 'Kid',
        plan: defaultValues.plan || "",
        price: defaultValues.price || undefined,
        temporaryPassword: defaultValues.temporaryPassword || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultValues?.email,
    defaultValues?.name,
    defaultValues?.roles,
    (defaultValues as any)?.role,
    defaultValues?.tenant_id,
    defaultValues?.membership_id,
    defaultValues?.rank,
    defaultValues?.stripes,
    defaultValues?.memberType,
    defaultValues?.plan,
    defaultValues?.price,
    defaultValues?.picture,
    mode,
  ]);

  function handleSubmit(data: UserFormValues) {
    if (!onSubmit) {
      console.error("onSubmit is not defined");
      return;
    }

    onSubmit({
      email: data.email || "",
      name: data.name,
      roles: data.roles || ["student"],
      tenant_id: data.tenant_id || "",
      membership_id: data.membership_id,
      rank: data.rank || "White",
      stripes: data.stripes || 0,
      memberType: data.memberType || "Adult",
      plan: data.plan,
      price: (data as any).price ?? undefined,
      picture: defaultValues?.picture || undefined,
      email_verified: mode === "create" ? false : undefined,
      temporaryPassword: (data as any).temporaryPassword || undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("members.form.email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("members.form.emailPlaceholder")}
                  {...field}
                  disabled={mode === "edit"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "create" && (
          <FormField
            control={form.control}
            name="temporaryPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("members.form.temporaryPassword") || "Contraseña Temporal"}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t("members.form.temporaryPasswordPlaceholder") || "Contraseña temporal para el usuario"}
                      {...field}
                    />
                    <PasswordGenerator
                      onPasswordGenerated={(password) => {
                        field.onChange(password);
                        form.setValue('temporaryPassword', password);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("members.form.name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("members.form.namePlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="tenant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("members.form.tenant")}</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || (tenants.length > 0 ? tenants[0].id : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("members.form.tenantPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memberType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("members.form.memberType")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("members.form.memberTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adult">{t("members.memberType.adult")}</SelectItem>
                      <SelectItem value="Kid">{t("members.memberType.kid")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("members.form.plan")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("members.form.planPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.type}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("members.form.price", "Precio mensual (€)")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t("members.form.pricePlaceholder", "Ej: 50.00")}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : parseFloat(value) || 0);
                    }}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("members.form.rank")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("members.form.rankPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="White">{t("members.rank.whiteBelt")}</SelectItem>
                      <SelectItem value="Blue">{t("members.rank.blueBelt")}</SelectItem>
                      <SelectItem value="Purple">{t("members.rank.purpleBelt")}</SelectItem>
                      <SelectItem value="Brown">{t("members.rank.brownBelt")}</SelectItem>
                      <SelectItem value="Black">{t("members.rank.blackBelt")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stripes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("members.form.stripes")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="4"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value || 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            data-testid="submit-button"
            disabled={isLoading}
          >
            {isLoading ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
