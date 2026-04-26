import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createDojoSchema, MARTIAL_ART_RANKS } from '@pantera-negra/shared';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const martialArts = Object.keys(MARTIAL_ART_RANKS) as (keyof typeof MARTIAL_ART_RANKS)[];

const MARTIAL_ART_LABELS: Record<string, string> = {
  BJJ: 'Brazilian Jiu-Jitsu',
  Karate: 'Karate',
  Judo: 'Judo',
  Taekwondo: 'Taekwondo',
  MuayThai: 'Muay Thai',
  MMA: 'Mixed Martial Arts (MMA)',
  Boxing: 'Boxing',
  Kickboxing: 'Kickboxing',
  Wrestling: 'Wrestling',
  Other: 'Other',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type FormValues = z.infer<typeof createDojoSchema>;

interface DojoFormProps {
  orgId: string;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function DojoForm({ orgId, defaultValues, onSubmit, isLoading, submitLabel = 'Save Dojo' }: DojoFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(createDojoSchema),
    defaultValues: {
      name: '',
      martial_art: 'BJJ',
      organization_id: orgId,
      description: '',
      logo_url: '',
      phone: '',
      email: '',
      website: '',
      address: { street: '', city: '', state: '', country: '', postal_code: '' },
      ...defaultValues,
    },
  });

  const martialArt = form.watch('martial_art');
  const ranks = martialArt ? MARTIAL_ART_RANKS[martialArt] : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Dojo Name *</FormLabel>
              <FormControl><Input placeholder="Pantera Negra - São Paulo" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="martial_art" render={({ field }) => (
            <FormItem>
              <FormLabel>Martial Art *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select martial art" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {martialArts.map(art => (
                    <SelectItem key={art} value={art}>{MARTIAL_ART_LABELS[art] ?? art}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ranks.length > 0 && (
                <FormDescription>
                  Rank system: {ranks.map(r => r.label).join(' → ')}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="About this dojo..." rows={3} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="+55 11 9999-9999" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="dojo@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl><Input type="url" placeholder="https://yourdojo.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="logo_url" render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl><Input type="url" placeholder="https://yourdojo.com/logo.png" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Address</h3>
          <FormField control={form.control} name="address.street" render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormField control={form.control} name="address.city" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>City</FormLabel>
                <FormControl><Input placeholder="São Paulo" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address.state" render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl><Input placeholder="SP" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address.postal_code" render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl><Input placeholder="01000-000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="address.country" render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl><Input placeholder="Brazil" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
