// src/services/imagemService.ts
import api from './api';

class ImagemService {
  async uploadImagemItem(itemId: number, uri: string): Promise<void> {
  try {
    console.log('📤 Iniciando upload para item', itemId);
    console.log('📤 URI:', uri);
    
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    console.log('📤 filename:', filename);
    console.log('📤 type:', type);

    // @ts-ignore
    formData.append('imagem', {
      uri,
      name: filename,
      type,
    });

    const response = await api.post(`/imagens/item/${itemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Resposta do servidor:', response.data);
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    throw error;
  }
}

  async uploadImagemEntrega(entregaId: number, uri: string): Promise<void> {
    try {
      const formData = new FormData();
      
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore
      formData.append('imagem', {
        uri,
        name: filename,
        type,
      });

      await api.post(`/imagens/entrega/${entregaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  }
}

export const imagemService = new ImagemService();