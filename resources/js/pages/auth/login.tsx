import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
/* @chisel-registration */
import { register } from '@/routes';
/* @end-chisel-registration */
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
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
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@contoh.com"
                                    className="h-11 rounded-xl border-slate-200 focus-visible:border-[#FF9D50] focus-visible:ring-[#FF9D50]/30"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                    >
                                        <Lock className="size-4 text-slate-400" />
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs text-[#FF9D50] hover:text-[#e88c40]"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi"
                                    className="h-11 rounded-xl border-slate-200 focus-visible:border-[#FF9D50] focus-visible:ring-[#FF9D50]/30"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 py-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded border-slate-300 text-[#FF9D50] focus:ring-[#FF9D50]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-medium text-slate-600 dark:text-slate-400"
                                >
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl bg-[#FF9D50] font-semibold text-white shadow-lg shadow-orange-200/50 transition-all hover:bg-[#e88c40] active:scale-[0.98] dark:shadow-none"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="text-white" />
                                ) : (
                                    <LogIn className="mr-2 size-4" />
                                )}
                                Masuk ke Akun
                            </Button>
                        </div>

                        {/* @chisel-registration */}
                        <div className="text-muted-foreground mt-4 text-center text-sm">
                            Belum memiliki akun?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="inline-flex items-center gap-1 font-semibold text-[#FF9D50] underline-offset-4 hover:text-[#e88c40] hover:underline"
                            >
                                Daftar Sekarang{' '}
                                <ArrowRight className="size-3" />
                            </TextLink>
                        </div>
                        {/* @end-chisel-registration */}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Selamat Datang Kembali',
    description:
        'Silakan masukkan email dan kata sandi Anda untuk mengakses dashboard kasir.',
};
