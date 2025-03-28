import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  private currentMap?: Phaser.Tilemaps.Tilemap;
  private currentTileset?: Phaser.Tilemaps.Tileset;
  
  constructor() {
    super('GameScene');
  }

  preload(this: Phaser.Scene) {
    this.load.image('tileset', 'assets/tileset.png');
    
    // Adiciona input de arquivo para upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.position = 'absolute';
    fileInput.style.top = '10px';
    fileInput.style.left = '10px';
    fileInput.style.zIndex = '1000';
    document.getElementById('app')?.appendChild(fileInput);
    
    fileInput.addEventListener('change', (event) => {
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
  }

  create(this: Phaser.Scene) {
    (this as GameScene).loadMap();
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
    
    this.currentTileset = this.currentMap.addTilesetImage('tileset', 'tileset', 32, 32) as Phaser.Tilemaps.Tileset;
    this.currentMap.createLayer(0, this.currentTileset as Phaser.Tilemaps.Tileset, 0, 0);
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
      this.currentTileset = this.currentMap.addTilesetImage('tileset', 'tileset', 32, 32) as Phaser.Tilemaps.Tileset;
      
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
