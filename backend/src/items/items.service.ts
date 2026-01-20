import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpiryCheckService } from '../queue/expiry-check.service';
import { CreateFoodItemDto, CreateDocumentDto, UpdateFoodItemDto, UpdateDocumentDto, QueryItemsDto } from './dto';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private expiryCheckService: ExpiryCheckService,
  ) {}

  async createFood(userId: string, createFoodDto: CreateFoodItemDto) {
    const foodItem = await this.prisma.foodItem.create({
      data: {
        ...createFoodDto,
        userId,
        expiryDate: new Date(createFoodDto.expiryDate),
      },
    });

    // Schedule expiry notifications
    await this.expiryCheckService.scheduleNotificationsForNewItem(
      userId,
      foodItem.id,
      'FOOD',
      foodItem.name,
      foodItem.expiryDate,
    );

    return foodItem;
  }

  async createDocument(userId: string, createDocDto: CreateDocumentDto) {
    const { issuedDate, ...data } = createDocDto;
    const document = await this.prisma.document.create({
      data: {
        ...data,
        userId,
        expiryDate: new Date(data.expiryDate),
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
      },
    });

    // Schedule expiry notifications
    await this.expiryCheckService.scheduleNotificationsForNewItem(
      userId,
      document.id,
      'DOCUMENT',
      document.name,
      document.expiryDate,
    );

    return document;
  }

  async findAll(userId: string, query: QueryItemsDto) {
    const {
      type,
      category,
      search,
      expiringBefore,
      expiringAfter,
      page = 1,
      limit = 20,
      sortBy = 'expiryDate',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (expiringBefore || expiringAfter) {
      where.expiryDate = {};
      if (expiringBefore) {
        where.expiryDate.lte = new Date(expiringBefore);
      }
      if (expiringAfter) {
        where.expiryDate.gte = new Date(expiringAfter);
      }
    }

    // Fetch from both tables if no type specified, or from specific table
    if (!type || type === 'FOOD') {
      const [foodItems, totalFood] = await Promise.all([
        this.prisma.foodItem.findMany({
          where,
          skip: type === 'FOOD' ? skip : 0,
          take: type === 'FOOD' ? limit : undefined,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.foodItem.count({ where }),
      ]);

      if (type === 'FOOD') {
        return {
          items: foodItems.map(item => ({ ...item, type: 'FOOD' })),
          total: totalFood,
          page,
          limit,
          totalPages: Math.ceil(totalFood / limit),
        };
      }

      if (!type) {
        const [documents, totalDocs] = await Promise.all([
          this.prisma.document.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
          }),
          this.prisma.document.count({ where }),
        ]);

        const allItems = [
          ...foodItems.map(item => ({ ...item, type: 'FOOD' as const })),
          ...documents.map(item => ({ ...item, type: 'DOCUMENT' as const })),
        ].sort((a, b) => {
          const aVal = a[sortBy as keyof typeof a];
          const bVal = b[sortBy as keyof typeof b];

          // Handle null/undefined values
          if (aVal == null && bVal == null) return 0;
          if (aVal == null) return 1;
          if (bVal == null) return -1;

          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });

        const total = totalFood + totalDocs;
        const paginatedItems = allItems.slice(skip, skip + limit);

        return {
          items: paginatedItems,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }
    }

    if (type === 'DOCUMENT') {
      const [documents, totalDocs] = await Promise.all([
        this.prisma.document.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.document.count({ where }),
      ]);

      return {
        items: documents.map(item => ({ ...item, type: 'DOCUMENT' })),
        total: totalDocs,
        page,
        limit,
        totalPages: Math.ceil(totalDocs / limit),
      };
    }
  }

  async findOne(userId: string, id: string, type: 'FOOD' | 'DOCUMENT') {
    let item;

    if (type === 'FOOD') {
      item = await this.prisma.foodItem.findUnique({
        where: { id },
      });
    } else {
      item = await this.prisma.document.findUnique({
        where: { id },
      });
    }

    if (!item) {
      throw new NotFoundException(`Item not found`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return { ...item, type };
  }

  async updateFood(userId: string, id: string, updateFoodDto: UpdateFoodItemDto) {
    // First verify ownership
    await this.findOne(userId, id, 'FOOD');

    const updateData: any = { ...updateFoodDto };
    if (updateFoodDto.expiryDate) {
      updateData.expiryDate = new Date(updateFoodDto.expiryDate);
    }

    return this.prisma.foodItem.update({
      where: { id },
      data: updateData,
    });
  }

  async updateDocument(userId: string, id: string, updateDocDto: UpdateDocumentDto) {
    // First verify ownership
    await this.findOne(userId, id, 'DOCUMENT');

    const updateData: any = { ...updateDocDto };
    if (updateDocDto.expiryDate) {
      updateData.expiryDate = new Date(updateDocDto.expiryDate);
    }
    if (updateDocDto.issuedDate) {
      updateData.issuedDate = new Date(updateDocDto.issuedDate);
    }

    return this.prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string, type: 'FOOD' | 'DOCUMENT') {
    // First verify ownership
    await this.findOne(userId, id, type);

    if (type === 'FOOD') {
      await this.prisma.foodItem.delete({
        where: { id },
      });
    } else {
      await this.prisma.document.delete({
        where: { id },
      });
    }

    return { message: 'Item deleted successfully' };
  }

  async getExpiringItems(userId: string, daysAhead: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const [foodItems, documents] = await Promise.all([
      this.prisma.foodItem.findMany({
        where: {
          userId,
          expiryDate: {
            gte: now,
            lte: futureDate,
          },
        },
        orderBy: { expiryDate: 'asc' },
      }),
      this.prisma.document.findMany({
        where: {
          userId,
          expiryDate: {
            gte: now,
            lte: futureDate,
          },
        },
        orderBy: { expiryDate: 'asc' },
      }),
    ]);

    return {
      items: [
        ...foodItems.map(item => ({ ...item, type: 'FOOD' })),
        ...documents.map(item => ({ ...item, type: 'DOCUMENT' })),
      ].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()),
    };
  }

  async getStats(userId: string) {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [
      totalFood,
      totalDocuments,
      expiredFood,
      expiredDocuments,
      expiringFood,
      expiringDocuments,
    ] = await Promise.all([
      this.prisma.foodItem.count({ where: { userId } }),
      this.prisma.document.count({ where: { userId } }),
      this.prisma.foodItem.count({
        where: { userId, expiryDate: { lt: now } },
      }),
      this.prisma.document.count({
        where: { userId, expiryDate: { lt: now } },
      }),
      this.prisma.foodItem.count({
        where: {
          userId,
          expiryDate: { gte: now, lte: sevenDaysFromNow },
        },
      }),
      this.prisma.document.count({
        where: {
          userId,
          expiryDate: { gte: now, lte: sevenDaysFromNow },
        },
      }),
    ]);

    return {
      total: totalFood + totalDocuments,
      totalFood,
      totalDocuments,
      expired: expiredFood + expiredDocuments,
      expiredFood,
      expiredDocuments,
      expiringSoon: expiringFood + expiringDocuments,
      expiringFood,
      expiringDocuments,
    };
  }
}
