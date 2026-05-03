import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { Body, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: any) {
        const user = await this.authService.register(dto);
        return this.authService.login(user);
    }

    @Post('login')
    async login(@Body() dto: any) {
        const user = await this.authService.validateUser(dto.email, dto.password);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req: any) {
        return this.authService.getMe(req.user.userId);
    }
}
