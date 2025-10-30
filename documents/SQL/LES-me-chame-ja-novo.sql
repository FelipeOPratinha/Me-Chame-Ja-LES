-- ==========================================
-- BANCO DE DADOS: sistema_entregas
-- ==========================================
CREATE DATABASE IF NOT EXISTS sistema_entregas;
USE sistema_entregas;

-- ==========================================
-- Tabela: usuario
-- ==========================================
CREATE TABLE usuario (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_tipo VARCHAR(50) NOT NULL,
    usuario_nome VARCHAR(100) NOT NULL,
    usuario_email VARCHAR(100) UNIQUE NOT NULL,
    usuario_senha VARCHAR(255) NOT NULL,
    usuario_telefone VARCHAR(20),
    usuario_data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_pontos_fidelidade INT DEFAULT 0,
    usuario_ativo INT DEFAULT 1
);

-- ==========================================
-- Tabela: veiculo
-- ==========================================
CREATE TABLE veiculo (
    veiculo_id INT AUTO_INCREMENT PRIMARY KEY,
    veiculo_tipo VARCHAR(50),
    veiculo_ano INT,
    veiculo_placa VARCHAR(20) UNIQUE,
    veiculo_marca VARCHAR(50),
    veiculo_modelo VARCHAR(50),
    veiculo_capacidade DECIMAL(10,2),
    veiculo_transporte_animal BOOLEAN DEFAULT FALSE,
    veiculo_transporte_material_construcao BOOLEAN DEFAULT FALSE,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id)
);

-- ==========================================
-- Tabela: entrega
-- ==========================================
CREATE TABLE entrega (
    entrega_id INT AUTO_INCREMENT PRIMARY KEY,
    entrega_valor DECIMAL(10,2),
    entrega_status VARCHAR(50),
    entrega_descricao TEXT,
    entrega_tipo_categoria VARCHAR(50),
    entrega_tipo_transporte VARCHAR(50),
    entrega_data_agendada DATETIME,
    entrega_data_finalizacao DATETIME,
    trajeto_id INT,
    veiculo_id INT,
    motorista_id INT,
    solicitante_id INT,
    FOREIGN KEY (veiculo_id) REFERENCES veiculo(veiculo_id),
    FOREIGN KEY (motorista_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (solicitante_id) REFERENCES usuario(usuario_id)
);

-- ==========================================
-- Tabela: endereco
-- ==========================================
CREATE TABLE endereco (
    endereco_id INT AUTO_INCREMENT PRIMARY KEY,
    endereco_logradouro VARCHAR(255) NOT NULL,
    endereco_numero VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(2),
    endereco_cep VARCHAR(15),
    endereco_latitude DECIMAL(10,6),
    endereco_longitude DECIMAL(10,6)
);

-- ==========================================
-- Tabela: trajeto
-- ==========================================
CREATE TABLE trajeto (
    trajeto_id INT AUTO_INCREMENT PRIMARY KEY,
    trajeto_ordem INT,
    entrega_id INT,
    endereco_id INT,
    FOREIGN KEY (entrega_id) REFERENCES entrega(entrega_id),
    FOREIGN KEY (endereco_id) REFERENCES endereco(endereco_id)
);

-- ==========================================
-- Tabela: item_entrega
-- ==========================================
CREATE TABLE item_entrega (
    item_entrega_id INT AUTO_INCREMENT PRIMARY KEY,
    item_entrega_nome VARCHAR(100),
    item_entrega_pesagem DECIMAL(10,2),
    item_entrega_quantidade INT,
    item_entrega_observacoes TEXT,
    entrega_id INT,
    FOREIGN KEY (entrega_id) REFERENCES entrega(entrega_id)
);