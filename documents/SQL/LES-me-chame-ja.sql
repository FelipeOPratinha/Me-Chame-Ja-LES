CREATE DATABASE  IF NOT EXISTS `me_chame_ja` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `me_chame_ja`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: me_chame_ja
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `entregas`
--

DROP TABLE IF EXISTS `entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas` (
  `entrega_id` int NOT NULL AUTO_INCREMENT,
  `solicitante_id` int NOT NULL,
  `motorista_id` int DEFAULT NULL,
  `veiculo_id` int DEFAULT NULL,
  `tipo_veiculo` varchar(255) DEFAULT NULL,
  `status` enum('pagamento','pendente','aceita','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'pendente',
  `tipo` enum('documentos','comida','produtos_pequenos','mudancas','materiais_de_construcao','outros') NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `endereco_origem` varchar(255) NOT NULL,
  `endereco_destino` varchar(255) NOT NULL,
  `horario_agendado` datetime DEFAULT NULL,
  `horario_concluido` datetime DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`entrega_id`),
  KEY `solicitante_id` (`solicitante_id`),
  KEY `motorista_id` (`motorista_id`),
  KEY `veiculo_id` (`veiculo_id`),
  CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios` (`usuario_id`),
  CONSTRAINT `entregas_ibfk_2` FOREIGN KEY (`motorista_id`) REFERENCES `usuarios` (`usuario_id`),
  CONSTRAINT `entregas_ibfk_3` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos` (`veiculo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
INSERT INTO `entregas` VALUES (2,2,3,2,'carro','aceita','documentos','Entrega de documentos importantes','Rua C, 789 - Jardim Universo, Mogi das Cruzes','Rua D, 101 - Vila Oliveira, Mogi das Cruzes','2025-10-01 14:00:00',NULL,45.00);

/*!40000 ALTER TABLE `entregas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_entrega`
--

DROP TABLE IF EXISTS `itens_entrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_entrega` (
  `item_entrega_id` int NOT NULL AUTO_INCREMENT,
  `entrega_id` int NOT NULL,
  `nome_item` varchar(100) DEFAULT NULL,
  `quantidade` int DEFAULT NULL,
  `peso_kg` int DEFAULT NULL,
  `observacoes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`item_entrega_id`),
  KEY `entrega_id` (`entrega_id`),
  CONSTRAINT `itens_entrega_ibfk_1` FOREIGN KEY (`entrega_id`) REFERENCES `entregas` (`entrega_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_entrega`
--

LOCK TABLES `itens_entrega` WRITE;
/*!40000 ALTER TABLE `itens_entrega` DISABLE KEYS */;
/*!40000 ALTER TABLE `itens_entrega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `usuario_id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `tipo_usuario` enum('motorista','solicitante') NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Carlos Silva','carlos.silva@example.com','senha_hash1','11999998888','motorista','2025-09-30 22:00:13'),(2,'Ana Oliveira','ana.oliveira@example.com','senha_hash2','21988887777','solicitante','2025-09-30 22:00:13'),(3,'Marcos Pereira','marcos.pereira@example.com','senha_hash3','31977776666','motorista','2025-09-30 22:00:13');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `veiculos`
--

DROP TABLE IF EXISTS `veiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `veiculos` (
  `veiculo_id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `placa` varchar(15) NOT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `ano` int DEFAULT NULL,
  `tipo` enum('carro','caminhao','moto','van','outro') NOT NULL,
  `capacidade_kg` int DEFAULT NULL,
  `transporte_animais` tinyint(1) DEFAULT '0',
  `transporte_material_construcao` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`veiculo_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `veiculos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `veiculos`
--

LOCK TABLES `veiculos` WRITE;
/*!40000 ALTER TABLE `veiculos` DISABLE KEYS */;
INSERT INTO `veiculos` VALUES (1,1,'ABC1234','Volvo','FH',2018,'caminhao',15000,0,1),(2,3,'XYZ9876','Honda','CG 160',2020,'moto',150,0,0);
/*!40000 ALTER TABLE `veiculos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-30 19:09:42
