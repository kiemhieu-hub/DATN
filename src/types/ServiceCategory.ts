export interface ServiceCategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
    serviceCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceCategoryPayload {
    name: string;
    slug: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
}