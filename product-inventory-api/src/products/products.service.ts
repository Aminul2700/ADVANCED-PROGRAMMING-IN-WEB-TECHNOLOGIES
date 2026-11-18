import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Products } from './entities/products.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PartialUpdateProductDto } from './dto/partial-update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private productsRepo: Repository<Products>,
  ) {}

  private async findProductOrFail(id: number): Promise<Products> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = this.productsRepo.create(dto); 
    const saved = await this.productsRepo.save(product); 
    return { message: 'Product created successfully', data: saved };
  }

  async findAll() {
    const products = await this.productsRepo.find({
      order: { createdAt: 'DESC' }, 
    });
    return {
      message: 'Products fetched successfully',
      count: products.length,
      data: products,
    };
  }

  async findOne(id: number) {
    const product = await this.findProductOrFail(id);
    return { message: 'Product fetched successfully', data: product };
  }


  async update(id: number, dto: PartialUpdateProductDto) {
    await this.findProductOrFail(id); 
    await this.productsRepo.update(id, dto);
    const updated = await this.findProductOrFail(id); 
    return { message: 'Product updated successfully', data: updated };
  }

  
  async replace(id: number, dto: UpdateProductDto) {
    await this.findProductOrFail(id);
    await this.productsRepo.update(id, {
      name: dto.name,
      description: dto.description ?? null, 
      price: dto.price,
      stock: dto.stock ?? 0,
      category: dto.category,
      isActive: dto.isActive ?? true,
    } as Partial<Products>);
    const updated = await this.findProductOrFail(id);
    return { message: 'Product replaced successfully', data: updated };
  }

  async remove(id: number) {
    await this.findProductOrFail(id); 
    await this.productsRepo.delete(id);
    return { message: 'Product deleted successfully', id };
  }

  async findByCategory(category: string) {
    const products = await this.productsRepo.find({ where: { category } });
    return {
      message: `Products in category ${category} fetched successfully`,
      count: products.length,
      data: products,
    };
  }

  async search(keyword: string) {
    const products = await this.productsRepo.find({
      where: { name: ILike(`%${keyword}%`) }, 
    });
    return {
      message: 'Search completed successfully',
      count: products.length,
      data: products,
    };
  }

  async toggleActive(id: number) {
    const product = await this.findProductOrFail(id);
    product.isActive = !product.isActive; 
    const saved = await this.productsRepo.save(product);
    return { message: 'Product status toggled successfully', data: saved };
  }
}