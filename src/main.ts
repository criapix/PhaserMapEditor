import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  private currentMap?: Phaser.Tilemaps.Tilemap;
  private currentTileset?: Phaser.Tilemaps.Tileset;
  private tilesetKey: string = 'tileset';
  private tilesetSource: string = 'assets/tileset.png';
  private selectedTileIndex: number = 0;
  private tileSelector?: Phaser.GameObjects.Graphics;
  private tilesetImage?: Phaser.GameObjects.Image;
  private selectedTileMarker?: Phaser.GameObjects.Graphics;
  private currentLayer?: Phaser.Tilemaps.TilemapLayer;
  
  constructor() {
    super('GameScene');
  }

  preload(this: Phaser.Scene) {
    this.load.image((this as GameScene).tilesetKey, (this as GameScene).tilesetSource);
    this.load.json('defaultMap', 'assets/map.json');
    
    // Adiciona input de arquivo para upload do mapa JSON
    const mapFileInput = document.createElement('input');
    mapFileInput.type = 'file';
    mapFileInput.accept = '.json';
    mapFileInput.style.position = 'absolute';
    mapFileInput.style.top = '10px';
    mapFileInput.style.left = '10px';
    mapFileInput.style.zIndex = '1000';
    mapFileInput.title = 'Carregar mapa JSON';
    document.getElementById('app')?.appendChild(mapFileInput);
    
    mapFileInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = JSON.parse(e.target?.result as string);
          (this as GameScene).updateMap(json);
        };
        reader.readAsText(file);
      }
    });
    
    // Adiciona input de arquivo para upload do tileset
    const tilesetFileInput = document.createElement('input');
    tilesetFileInput.type = 'file';
    tilesetFileInput.accept = '.png,.jpg,.jpeg';
    tilesetFileInput.style.position = 'absolute';
    tilesetFileInput.style.top = '10px';
    tilesetFileInput.style.left = '150px';
    tilesetFileInput.style.zIndex = '1000';
    tilesetFileInput.title = 'Carregar tileset';
    document.getElementById('app')?.appendChild(tilesetFileInput);
    
    tilesetFileInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          (this as GameScene).updateTileset(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  create(this: Phaser.Scene) {
    // Carrega o mapa padrão do arquivo map.json
    const mapData = this.cache.json.get('defaultMap');
    if (mapData) {
      (this as GameScene).updateMap(mapData);
    } else {
      // Fallback para o mapa vazio se o arquivo não for carregado
      (this as GameScene).loadMap();
    }
    
    // Cria o seletor de tiles
    this.createTileSelector();
    
    // Cria o marcador de tile selecionado
    this.createSelectedTileMarker();
  }
  
  private loadMap() {
    if (this.currentMap) {
      this.currentMap.destroy();
    }
    
    // Cria um mapa vazio por padrão
    this.currentMap = this.make.tilemap({ 
      data: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ],
      tileWidth: 32,
      tileHeight: 32
    });
    
    this.currentTileset = this.currentMap.addTilesetImage('tileset', this.tilesetKey, 32, 32) as Phaser.Tilemaps.Tileset;
    this.currentMap.createLayer(0, this.currentTileset as Phaser.Tilemaps.Tileset, 0, 0);
  }
  
  private createTileSelector(): void {
    // Cria um painel para o tileset
    const tilesetPanel = this.add.graphics();
    tilesetPanel.fillStyle(0x222222, 0.8);
    tilesetPanel.fillRect(10, 300, 256, 256);
    
    // Adiciona o tileset como uma imagem
    this.tilesetImage = this.add.image(10, 300, this.tilesetKey);
    this.tilesetImage.setOrigin(0, 0);
    this.tilesetImage.setScale(0.5); // Reduz o tamanho para caber na tela
    
    // Adiciona texto explicativo
    this.add.text(10, 280, 'Clique para selecionar um tile:', { fontSize: '16px', color: '#ffffff' });
    
    // Adiciona interatividade ao tileset
    this.tilesetImage.setInteractive();
    this.tilesetImage.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Calcula qual tile foi clicado
      const x = Math.floor((pointer.x - this.tilesetImage!.x) / (32 * 0.5));
      const y = Math.floor((pointer.y - this.tilesetImage!.y) / (32 * 0.5));
      
      // Calcula o índice do tile no tileset (assumindo um tileset de 8x8)
      const tilesetWidth = 8; // Número de tiles na horizontal do tileset
      this.selectedTileIndex = y * tilesetWidth + x;
      
      // Atualiza o marcador de seleção
      this.updateSelectedTileMarker();
      
      console.log(`Tile selecionado: ${this.selectedTileIndex}`);
    });
  }
  
  private createSelectedTileMarker(): void {
    // Cria um marcador para mostrar qual tile está selecionado no mapa
    this.selectedTileMarker = this.add.graphics();
    this.selectedTileMarker.lineStyle(2, 0xffffff, 1);
    this.selectedTileMarker.strokeRect(0, 0, 32, 32);
    this.selectedTileMarker.setVisible(false);
    
    // Adiciona interatividade ao mapa
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.currentMap || !this.currentLayer) return;
      
      // Converte a posição do ponteiro para coordenadas de tile
      const tileX = this.currentMap.worldToTileX(pointer.x);
      const tileY = this.currentMap.worldToTileY(pointer.y);
      
      // Posiciona o marcador na posição do tile
      if (tileX >= 0 && tileY >= 0 && tileX < this.currentMap.width && tileY < this.currentMap.height) {
        const worldX = this.currentMap.tileToWorldX(tileX);
        const worldY = this.currentMap.tileToWorldY(tileY);
        
        this.selectedTileMarker!.setPosition(worldX, worldY);
        this.selectedTileMarker!.setVisible(true);
      } else {
        this.selectedTileMarker!.setVisible(false);
      }
    });
    
    // Adiciona interatividade para colocar tiles no mapa
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.currentMap || !this.currentLayer || pointer.y < 280) return;
      
      // Verifica se o clique foi no mapa e não no seletor de tiles
      if (pointer.x < 10 || pointer.x > 266 || pointer.y < 300 || pointer.y > 556) {
        // Converte a posição do ponteiro para coordenadas de tile
        const tileX = this.currentMap.worldToTileX(pointer.x);
        const tileY = this.currentMap.worldToTileY(pointer.y);
        
        // Coloca o tile selecionado na posição clicada
        if (tileX >= 0 && tileY >= 0 && tileX < this.currentMap.width && tileY < this.currentMap.height) {
          this.currentLayer.putTileAt(this.selectedTileIndex, tileX, tileY);
          console.log(`Tile ${this.selectedTileIndex} colocado em (${tileX}, ${tileY})`);
        }
      }
    });
  }
  
  private updateSelectedTileMarker(): void {
    if (!this.tileSelector) {
      this.tileSelector = this.add.graphics();
    } else {
      this.tileSelector.clear();
    }
    
    // Desenha um retângulo ao redor do tile selecionado no tileset
    this.tileSelector.lineStyle(2, 0xffff00, 1);
    
    // Calcula a posição do tile selecionado no tileset
    const tilesetWidth = 8; // Número de tiles na horizontal do tileset
    const tileX = this.selectedTileIndex % tilesetWidth;
    const tileY = Math.floor(this.selectedTileIndex / tilesetWidth);
    
    // Desenha o retângulo de seleção
    const x = this.tilesetImage!.x + tileX * 32 * 0.5;
    const y = this.tilesetImage!.y + tileY * 32 * 0.5;
    this.tileSelector.strokeRect(x, y, 32 * 0.5, 32 * 0.5);
  }
  
  private updateMap(json: any): void {
    // Remove o mapa atual
    if (this.currentMap) {
      this.currentMap.destroy();
    }
    
    // Verifica se o JSON tem a estrutura esperada
    if (!json.layers || !json.layers.length) {
      console.error('Formato de JSON inválido: não contém camadas');
      return;
    }
    
    // Obtém os nomes de todas as camadas disponíveis no JSON
    const availableLayers = json.layers.map((layer: any) => layer.name);
    console.log('Camadas disponíveis no mapa:', availableLayers);
    
    try {
      // Carrega o mapa diretamente do JSON
      this.currentMap = this.make.tilemap({
        width: json.width,
        height: json.height,
        tileWidth: json.tilewidth || 32,
        tileHeight: json.tileheight || 32
      });
      
      // Adiciona o tileset ao mapa
      this.currentTileset = this.currentMap.addTilesetImage('tileset', this.tilesetKey, 32, 32) as Phaser.Tilemaps.Tileset;
      
      // Cria as camadas diretamente a partir dos dados do JSON
      for (const layerData of json.layers) {
        try {
          if (layerData.type === 'tilelayer') {
            // Cria uma camada vazia
            const layer = this.currentMap.createBlankLayer(
              layerData.name,
              this.currentTileset as Phaser.Tilemaps.Tileset,
              0, 0,
              layerData.width,
              layerData.height
            );
            
            // Define a camada atual como a primeira camada de tiles encontrada
            if (layerData.type === 'tilelayer' && !this.currentLayer) {
              this.currentLayer = layer;
            }
            
            // Preenche a camada com os dados do JSON
            if (layer && layerData.data) {
              for (let y = 0; y < layerData.height; y++) {
                for (let x = 0; x < layerData.width; x++) {
                  const tileIndex = y * layerData.width + x;
                  const tileId = layerData.data[tileIndex];
                  if (tileId > 0) {
                    layer.putTileAt(tileId - 1, x, y); // -1 porque o Phaser usa índice baseado em 0
                  }
                }
              }
              
              // Configura a opacidade da camada
              if (layerData.opacity !== undefined) {
                layer.setAlpha(layerData.opacity);
              }
              
              // Configura colisões se for a camada de plataformas
              if (layerData.name === 'platforms') {
                layer.setCollisionByExclusion([-1]); // Colide com todos os tiles exceto os vazios
              }
              
              console.log(`Camada '${layerData.name}' criada com sucesso`);
            }
          }
        } catch (error) {
          console.error(`Erro ao criar camada '${layerData.name}':`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar o mapa:', error);
    }
  }  
  
  private updateTileset(dataUrl: string): void {
    // Cria uma nova chave para o tileset
    const newTilesetKey = 'tileset_' + Date.now();
    
    // Carrega a nova imagem do tileset
    this.load.image(newTilesetKey, dataUrl);
    
    // Quando a carga estiver completa, atualiza o tileset no mapa
    this.load.once('complete', () => {
      // Atualiza a chave do tileset atual
      this.tilesetKey = newTilesetKey;
      
      // Se houver um mapa carregado, recarrega-o com o novo tileset
      if (this.currentMap) {
        // Guarda os dados do mapa atual
        const mapData = this.cache.json.get('defaultMap');
        
        // Recarrega o mapa com o novo tileset
        if (mapData) {
          this.updateMap(mapData);
        } else {
          this.loadMap();
        }
      }
      
      console.log('Tileset atualizado com sucesso!');
    });
    
    // Inicia o carregamento
    this.load.start();
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
  parent: 'app',
  audio: { disableWebAudio: true }
};

new Phaser.Game(config);
