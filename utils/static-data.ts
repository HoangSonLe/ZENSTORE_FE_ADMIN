// This file provides utility functions for fetching static data
// to replace server-side API routes

// Import mock data
import * as mockData from '../public/data/mock-data';

// Generic function to simulate API responses
export async function fetchStaticData(dataType: string, params?: any) {
  // Simulate network delay for realistic behavior
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return appropriate data based on the requested type
  switch (dataType) {
    case 'boards':
      return {
        isSuccess: true,
        data: mockData.boards,
        status: 200
      };
    case 'comments':
      return {
        isSuccess: true,
        data: mockData.comments,
        status: 200
      };
    case 'tasks':
      return {
        isSuccess: true,
        data: mockData.tasks,
        status: 200
      };
    case 'users':
      return {
        isSuccess: true,
        data: mockData.users,
        status: 200
      };
    case 'projects':
      return {
        isSuccess: true,
        data: mockData.projects,
        status: 200
      };
    case 'emails':
      return {
        isSuccess: true,
        data: mockData.emails,
        status: 200
      };
    case 'chats':
      return {
        isSuccess: true,
        data: mockData.chats,
        status: 200
      };
    default:
      return {
        isSuccess: false,
        message: 'Data type not found',
        status: 404
      };
  }
}

// Function to get a specific item by ID
export async function fetchStaticItemById(dataType: string, id: string | number) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Get the appropriate data array
  const dataArray = (mockData as any)[dataType];
  
  if (!dataArray) {
    return {
      isSuccess: false,
      message: 'Data type not found',
      status: 404
    };
  }
  
  // Find the item with the matching ID
  const item = dataArray.find((item: any) => item.id === id);
  
  if (item) {
    return {
      isSuccess: true,
      data: item,
      status: 200
    };
  } else {
    return {
      isSuccess: false,
      message: 'Item not found',
      status: 404
    };
  }
}

// Add more utility functions as needed
