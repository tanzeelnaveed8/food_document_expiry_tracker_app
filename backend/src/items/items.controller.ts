import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './items.service';
import { CreateFoodItemDto, CreateDocumentDto, UpdateFoodItemDto, UpdateDocumentDto, QueryItemsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('food')
  @HttpCode(HttpStatus.CREATED)
  createFood(@GetUser('id') userId: string, @Body() createFoodDto: CreateFoodItemDto) {
    return this.itemsService.createFood(userId, createFoodDto);
  }

  @Post('document')
  @HttpCode(HttpStatus.CREATED)
  createDocument(@GetUser('id') userId: string, @Body() createDocDto: CreateDocumentDto) {
    return this.itemsService.createDocument(userId, createDocDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string, @Query() query: QueryItemsDto) {
    return this.itemsService.findAll(userId, query);
  }

  @Get('expiring')
  getExpiringItems(
    @GetUser('id') userId: string,
    @Query('days') days?: string,
  ) {
    const daysAhead = days ? parseInt(days, 10) : 7;
    return this.itemsService.getExpiringItems(userId, daysAhead);
  }

  @Get('stats')
  getStats(@GetUser('id') userId: string) {
    return this.itemsService.getStats(userId);
  }

  @Get(':type/:id')
  findOne(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('type') type: string,
  ) {
    const normalizedType = type.toUpperCase() as 'FOOD' | 'DOCUMENT';
    return this.itemsService.findOne(userId, id, normalizedType);
  }

  @Patch('food/:id')
  updateFood(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateFoodDto: UpdateFoodItemDto,
  ) {
    return this.itemsService.updateFood(userId, id, updateFoodDto);
  }

  @Patch('document/:id')
  updateDocument(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDocDto: UpdateDocumentDto,
  ) {
    return this.itemsService.updateDocument(userId, id, updateDocDto);
  }

  @Delete(':type/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('type') type: string,
  ) {
    const normalizedType = type.toUpperCase() as 'FOOD' | 'DOCUMENT';
    return this.itemsService.remove(userId, id, normalizedType);
  }

  @Post(':type/:id/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const normalizedType = type.toUpperCase() as 'FOOD' | 'DOCUMENT';
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    // Upload to Cloudinary
    const result = await this.cloudinaryService.uploadImage(file, 'expiry-tracker');

    // Update item with photo URL
    const photoUrl = result.secure_url;

    if (normalizedType === 'FOOD') {
      return this.itemsService.updateFood(userId, id, { photoUrl });
    } else {
      return this.itemsService.updateDocument(userId, id, { photoUrl });
    }
  }

  @Delete(':type/:id/photo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhoto(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('type') type: string,
  ) {
    const normalizedType = type.toUpperCase() as 'FOOD' | 'DOCUMENT';
    // Get the item to find the photo URL
    const item = await this.itemsService.findOne(userId, id, normalizedType);

    // Type guard to check if item has photoUrl
    const photoUrl = 'photoUrl' in item ? item.photoUrl : null;

    if (photoUrl) {
      // Extract public_id from Cloudinary URL
      const publicId = photoUrl.split('/').slice(-2).join('/').split('.')[0];
      await this.cloudinaryService.deleteImage(publicId);
    }

    // Remove photo URL from item
    if (normalizedType === 'FOOD') {
      return this.itemsService.updateFood(userId, id, { photoUrl: null });
    } else {
      return this.itemsService.updateDocument(userId, id, { photoUrl: null });
    }
  }
}
