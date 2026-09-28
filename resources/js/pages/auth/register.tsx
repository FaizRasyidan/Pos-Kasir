import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    UserPlus,
    Mail,
    Lock,
    User,
    ShieldCheck,
    ArrowRight,
} from 'lucide-react';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Daftar Akun" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                >
                                    <User className="size-4 text-slate-400" />
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama lengkap Anda"
                                    className="h-11 rounded-xl border-slate-200 focus-visible:border-[#FF9D50] focus-visible:ring-[#FF9D50]/30"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

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
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@contoh.com"
                                    className="h-11 rounded-xl border-slate-200 focus-visible:border-[#FF9D50] focus-visible:ring-[#FF9D50]/30"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                >
                                    <Lock className="size-4 text-slate-400" />
                                    Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Buat kata sandi minimal 8 karakter"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border-slate-200 focus-visible:border-[#FF9D50] focus-visible:ring-[#FF9D50]/30"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                >
                                    <ShieldCheck className="size-4 text-slate-400" />
                                    Konfirmasi Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border-slate-200 focus-visible:border-[#FF9D50] focus-visible:ring-[#FF9D50]/30"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl bg-[#FF9D50] font-semibold text-white shadow-lg shadow-orange-200/50 transition-all hover:bg-[#e88c40] active:scale-[0.98] dark:shadow-none"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner className="text-white" />
                                ) : (
                                    <UserPlus className="mr-2 size-4" />
                                )}
                                Buat Akun Baru
                            </Button>
                        </div>

                        <div className="text-muted-foreground mt-4 text-center text-sm">
                            Sudah memiliki akun?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="inline-flex items-center gap-1 font-semibold text-[#FF9D50] underline-offset-4 hover:text-[#e88c40] hover:underline"
                            >
                                Masuk di Sini <ArrowRight className="size-3" />
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Daftar Akun Baru',
    description:
        'Isi formulir di bawah ini untuk memulai sistem kasir modern Anda.',
};
