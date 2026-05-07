import { UpdateUserInput } from '../models/user.schemas';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';

export const userService = {
  async getAllUsers() {
    return userRepository.findAll();
  },

  async getUserById(id: string) {
    const user = await userRepository.findSafeById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async getPublicProfile(id: string) {
    const user = await userRepository.findPublicById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async updateUser(id: string, input: UpdateUserInput) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (input.email && input.email !== user.email) {
      const emailOwner = await userRepository.findByEmail(input.email);

      if (emailOwner) {
        throw new AppError('Email is already in use', 409);
      }
    }

    return userRepository.update(id, input);
  },

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return userRepository.softDelete(id);
  },
};
