import { v4 as uuidv4 } from 'uuid';

/**
 * Product Entity (Domain)
 *
 * Represents a product with its core attributes and business rules.
 * Uses UUID for ID as per API contract alignment.
 */
export class Product {
  // Properties match the database entity structure more closely now
  // ID is string (UUID)
  private _id: string;
  private _name: string;
  private _description: string | null;
  private _price: number;
  private _imageUrl: string | null;
  private _categoryId: number; // Internal reference to category
  private _categoryName?: string; // Optional: Store category name if loaded
  private _stock: number;
  private _disponivel: boolean;
  private _destaque: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string | null, // Can be null if creating a new one
    name: string,
    description: string | null,
    price: number,
    imageUrl: string | null,
    categoryId: number,
    stock: number = 0,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    disponivel: boolean = true,
    destaque: boolean = false,
    categoryName?: string // Optional category name from join
  ) {
    if (!id) {
        id = uuidv4(); // Generate UUID if not provided
    }
    // Basic validations
    if (name.trim().length === 0) throw new Error('Nome do produto não pode ser vazio');
    if (price <= 0) throw new Error('Preço do produto deve ser maior que zero');
    if (stock < 0) throw new Error('Estoque do produto não pode ser negativo');

    this._id = id;
    this._name = name;
    this._description = description;
    this._price = price;
    this._imageUrl = imageUrl;
    this._categoryId = categoryId;
    this._stock = stock;
    this._disponivel = disponivel;
    this._destaque = destaque;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._categoryName = categoryName;
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get price(): number { return this._price; }
  get imageUrl(): string | null { return this._imageUrl; }
  get categoryId(): number { return this._categoryId; }
  get categoryName(): string | undefined { return this._categoryName; }
  get stock(): number { return this._stock; }
  get disponivel(): boolean { return this._disponivel; }
  get destaque(): boolean { return this._destaque; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Setters / Business Logic Methods (Example)
  updateDetails(data: Partial<{ name: string; description: string | null; price: number; imageUrl: string | null; categoryId: number; stock: number; disponivel: boolean; destaque: boolean }>): void {
    if (data.name !== undefined) {
        if (data.name.trim().length === 0) throw new Error('Nome do produto não pode ser vazio');
        this._name = data.name;
    }
    if (data.description !== undefined) this._description = data.description;
    if (data.price !== undefined) {
        if (data.price <= 0) throw new Error('Preço do produto deve ser maior que zero');
        this._price = data.price;
    }
    if (data.imageUrl !== undefined) this._imageUrl = data.imageUrl;
    if (data.categoryId !== undefined) this._categoryId = data.categoryId; // Consider validating category existence elsewhere
    if (data.stock !== undefined) {
        if (data.stock < 0) throw new Error('Estoque do produto não pode ser negativo');
        this._stock = data.stock;
    }
    if (data.disponivel !== undefined) this._disponivel = data.disponivel;
    if (data.destaque !== undefined) this._destaque = data.destaque;

    this._updatedAt = new Date();
  }

  // No DTO methods here, keep entity focused on domain state/logic
}

