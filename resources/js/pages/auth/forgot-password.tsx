import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Kata Sandi" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                >
                                    <Mail className="size-4 text-slate-400" />
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@contoh.com"
                                    className="h-11 rounded-xl border-slate-200 focus-visible:border-[#FF9D50] focus-visible:ring-[#FF9D50]/30"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="mt-6">
                                <Button
                                    className="h-11 w-full rounded-xl bg-[#FF9D50] font-semibold text-white shadow-lg shadow-orange-200/50 transition-all hover:bg-[#e88c40] active:scale-[0.98] dark:shadow-none"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Kirim Tautan Pemulihan
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="text-muted-foreground text-center text-sm">
                    <TextLink
                        href={login()}
                        className="inline-flex items-center gap-1 font-semibold text-[#FF9D50] hover:text-[#e88c40]"
                    >
                        <ArrowLeft className="size-3" /> Kembali ke halaman
                        masuk
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi?',
    description:
        'Masukkan email terdaftar Anda untuk menerima tautan reset kata sandi.',
};
