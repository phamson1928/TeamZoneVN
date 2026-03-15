import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../lib/axios';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsLoading(true);
            // Gọi API đăng nhập
            const res = await apiClient.post('/auth/login', data);
            const result = res.data;

            if (result.success) {
                // Lưu token tạm để gọi API Get Profile kiểm tra Role
                localStorage.setItem('access_token', result.data.tokens.accessToken);
                localStorage.setItem('refresh_token', result.data.tokens.refreshToken);

                // Lấy thông tin User hiện tại để check role
                const meRes = await apiClient.get('/users/me');
                const user = meRes.data.data;

                if (user.role !== 'ADMIN') {
                    throw new Error('Tài khoản của bạn không có quyền truy cập Admin Dashboard.');
                }

                // Lưu thông tin admin
                localStorage.setItem('user', JSON.stringify(user));
                toast.success('Đăng nhập quản trị thành công!');

                // Chuyển hướng về trang trước đó hoặc Overview
                const origin = location.state?.from?.pathname || '/';
                navigate(origin, { replace: true });
            }
        } catch (error: any) {
            // Xóa tạm trong trường hợp login thành công nhưng không phải admin
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');

            if (error?.response?.data?.errorCode === 'UNAUTHORIZED' || error?.response?.status === 401) {
                toast.error('Sai email hoặc mật khẩu.');
            } else {
                toast.error(error.message || 'Lỗi hệ thống. Không thể đăng nhập.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-sm border border-gray-100/50 w-full max-w-md">

                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/30">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">GameZone Admin</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Hệ thống quản trị và kiểm duyệt</p>
                </div>

                {location.state?.error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600 text-center">
                        {location.state.error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            placeholder="admin@gamezone.vn"
                            {...register('email')}
                            className={`w-full bg-gray-50 border transition-all rounded-xl py-3 px-4 text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500 hover:border-gray-300'}`}
                        />
                        {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            className={`w-full bg-gray-50 border transition-all rounded-xl py-3 px-4 text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500 hover:border-gray-300'}`}
                        />
                        {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};
