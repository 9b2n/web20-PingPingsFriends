import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { getPartialFilesInfo } from 'utils/s3.util';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PatchPostRequestDto } from './dto/patchPostRequestDto';
import { multerTransFormOption } from 'config/s3.config';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPostResponseDto } from './dto/getPostResponse.dto';
import { ParseOptionalIntPipe } from 'common/pipes/parse-optional-int.pipe';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBody({ type: CreatePostDto })
  @ApiOperation({
    summary: '게시글 작성',
    description: '게시글을 작성하는 api입니다.',
  })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FilesInterceptor('upload', 10, multerTransFormOption))
  @UseGuards(AuthGuard('jwt'))
  async uploadFile(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
    const contentsInfos = getPartialFilesInfo(files);
    return await this.postService.create(createPostDto, contentsInfos, req.user.userId);
  }

  @ApiOperation({
    summary: '게시글 리스트 조회',
    description: '페이지 별 게시글 리스트를 조회하는 api입니다.',
  })
  @Get('habitats/:habitatId')
  async findAll(
    @Param('habitatId', ParseIntPipe) habitatId: number,
    @Query('lastPostId', ParseOptionalIntPipe) lastPostId?: number
  ) {
    return await this.postService.findAll(habitatId, lastPostId);
  }

  @ApiCreatedResponse({
    description: '성공',
    type: GetPostResponseDto,
  })
  @ApiOperation({
    summary: '특정 게시글 조회',
    description: '특정 게시글을 조회하는 api입니다.',
  })
  @Get(':id/habitats/:habitatId')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @ApiBody({ type: PatchPostRequestDto })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: Boolean })
  @ApiOperation({
    summary: '게시글 수정',
    description: '게시글을 수정하는 api입니다.',
  })
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('upload', 10, multerTransFormOption))
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchPostRequestDto: PatchPostRequestDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const contentsInfos = getPartialFilesInfo(files);
    return await this.postService.update(id, patchPostRequestDto, contentsInfos);
  }

  @ApiCreatedResponse({ type: Boolean })
  @ApiOperation({
    summary: '게시물 삭제',
    description: '게시물을 삭제하는 api입니다.',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}
