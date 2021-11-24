import { Injectable } from '@nestjs/common';
import FileDto from 'common/dto/transformFileDto';
import { RefreshTokenRepository } from 'src/refresh-tokens/refresh-token.repository';
import { getPartialFileInfo } from 'utils/s3.util';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['likedPost'] });
  }

  async findUserInfo(userId: number) {
    return await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.nickname',
        'habitat.id',
        'habitat.name',
        'species.name',
        'content.url',
      ])
      .leftJoin('user.habitat', 'habitat')
      .leftJoin('user.species', 'species')
      .leftJoin('user.content', 'content')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async createRefreshToken(userId: number, refreshToken: string, expireAt: Date) {
    const user = await this.userRepository.findOne(userId);

    if (!user) return false;

    delete user.password;
    delete user.contentsId;

    await this.refreshTokenRepository.saveRefreshToken(user.id, refreshToken, expireAt);

    return user;
  }

  async create(createUserDto: CreateUserDto, image?: FileDto) {
    const { name, sound, speciesId } = createUserDto;

    if ((name || sound) && speciesId) return false;
    if (!(name || sound) && !speciesId) return false;

    const foundUser = await this.userRepository.findOne({ username: createUserDto.username });
    if (foundUser) return false;

    const contentInfo = getPartialFileInfo(image);

    return await this.userRepository.saveUser(createUserDto, contentInfo);
  }

  async updateImage(image: FileDto, user: any) {
    return await this.userRepository.updateImage(image, user);
  }
}
