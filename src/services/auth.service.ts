import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { LoginInput, RegisterInput } from '../models/auth.schemas';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, env.bcryptSaltRounds);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    return {
      user,
      token,
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);

    if (!passwordMatches) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rank: user.rank,
        consecutiveWins: user.consecutiveWins,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rank: user.rank,
      consecutiveWins: user.consecutiveWins,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
