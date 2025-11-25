import storage from '@react-native-firebase/storage';

class StorageService {
  private storageRef = storage();

  async uploadFile(path: string, fileUri: string): Promise<string> {
    try {
      const reference = this.storageRef.ref(path);
      await reference.putFile(fileUri);
      return await reference.getDownloadURL();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload file');
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const reference = this.storageRef.ref(path);
      await reference.delete();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete file');
    }
  }

  async getDownloadURL(path: string): Promise<string> {
    try {
      const reference = this.storageRef.ref(path);
      return await reference.getDownloadURL();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get download URL');
    }
  }
}

export const storageService = new StorageService();

