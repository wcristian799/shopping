-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 04/05/2026 às 22:20
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `achados_perdidos_iguatemi`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `caixas_armazenamento`
--

CREATE TABLE `caixas_armazenamento` (
  `id` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `descricao` varchar(150) DEFAULT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `caixas_armazenamento`
--

INSERT INTO `caixas_armazenamento` (`id`, `numero`, `descricao`, `ativo`) VALUES
(1, 1, 'Caixa Eletrônicos - Prateleira A', 1),
(2, 2, 'Caixa Documentos - Prateleira B', 1),
(3, 3, 'Caixa Diversos - Prateleira C', 1),
(4, 4, 'Caixa Roupas - Prateleira D', 1),
(5, 5, 'Caixa Acessórios - Prateleira E', 1),
(6, 6, 'Caixa Pereciveis 2', 1),
(7, 7, 'Caixa Dinheiro', 1),
(8, 8, 'Caixa pereciveis', 1),
(9, 10, 'teste', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `destinos_finais`
--

CREATE TABLE `destinos_finais` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `destinos_finais`
--

INSERT INTO `destinos_finais` (`id`, `nome`, `ativo`) VALUES
(1, 'Correio', 1),
(2, 'Descartado', 1),
(3, 'Doação', 1),
(4, 'Finalizado', 1),
(5, 'Incinerado', 1),
(6, 'Inutilizado', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `entregas`
--

CREATE TABLE `entregas` (
  `id` int(11) NOT NULL,
  `data_entrega` date NOT NULL,
  `codigo_autenticacao` varchar(100) NOT NULL,
  `tipo_registro` enum('Procedimento padrão','Registro adicional de evidência') DEFAULT 'Procedimento padrão',
  `proprietario_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `entregas`
--

INSERT INTO `entregas` (`id`, `data_entrega`, `codigo_autenticacao`, `tipo_registro`, `proprietario_id`, `item_id`, `usuario_id`, `ativo`) VALUES
(1, '2026-02-05', '7A906524', 'Procedimento padrão', 1, 4, 1, 1),
(2, '2026-02-10', 'F66E34BC', 'Procedimento padrão', 2, 115, 1, 1),
(3, '2026-02-10', 'FAD90F72', 'Procedimento padrão', 3, 105, 1, 1),
(4, '2026-02-14', 'C334CD3B', 'Procedimento padrão', 4, 116, 1, 1),
(5, '2026-02-17', 'D5C3B25F', 'Procedimento padrão', 5, 158, 1, 1),
(6, '2026-02-17', '180176E1', 'Procedimento padrão', 6, 154, 1, 1),
(8, '2026-02-17', 'BDEAF636', 'Procedimento padrão', 8, 152, 1, 1),
(9, '2026-02-17', '4B3F7697', 'Procedimento padrão', 9, 104, 1, 1),
(10, '2026-02-17', 'F084D762', 'Procedimento padrão', 10, 117, 1, 1),
(11, '2026-02-17', '90BB70C6', 'Procedimento padrão', 11, 102, 1, 1),
(12, '2026-02-17', 'C97A33A2', 'Procedimento padrão', 5, 101, 1, 1),
(13, '2026-02-18', '4AFDFCB2', 'Procedimento padrão', 7, 19, 1, 1),
(14, '2026-02-18', 'E6E3DD1A', 'Registro adicional de evidência', 12, 20, 1, 1),
(15, '2026-02-20', '74DB61E2', 'Procedimento padrão', 13, 3, 1, 1),
(16, '2026-02-24', 'ATTYVDMD', 'Procedimento padrão', 14, 171, 1, 1),
(17, '2026-02-24', '0IZMYF92', 'Registro adicional de evidência', 15, 176, 1, 1),
(18, '2026-02-25', 'DE4A523A', 'Procedimento padrão', 10, 89, 1, 1),
(19, '2026-02-25', 'FBEBDDBC', 'Procedimento padrão', 16, 151, 1, 1),
(20, '2026-02-25', 'F9984AB6', 'Procedimento padrão', 3, 86, 1, 1),
(21, '2026-02-25', '561619D0', 'Procedimento padrão', 17, 87, 1, 1),
(22, '2026-02-25', '2E06E048', 'Procedimento padrão', 10, 178, 1, 1),
(23, '2026-02-25', '3F911633', 'Procedimento padrão', 3, 174, 1, 1),
(24, '2026-02-25', '9B443F50', 'Procedimento padrão', 4, 179, 1, 1),
(25, '2026-02-25', 'E22ED86F', 'Procedimento padrão', 18, 2, 1, 1),
(26, '2026-03-04', 'PIZ246CZ', 'Procedimento padrão', 19, 90, 1, 1),
(27, '2026-03-04', 'TU0QHUC0', 'Procedimento padrão', 20, 183, 1, 1),
(28, '2026-03-06', '7975692E', 'Procedimento padrão', 5, 191, 1, 1),
(29, '2026-03-07', '5JTGFPP0', 'Procedimento padrão', 21, 192, 1, 1),
(30, '2026-03-07', '0IYQP3PK', 'Registro adicional de evidência', 22, 212, 1, 1),
(31, '2026-03-08', 'LDAUHH26', 'Procedimento padrão', 23, 218, 1, 1),
(32, '2026-03-09', '1J5JQEUT', 'Procedimento padrão', 24, 219, 1, 1),
(33, '2026-03-12', 'BA356A56', 'Procedimento padrão', 4, 217, 1, 1),
(34, '2026-03-12', 'WGAS3S0B', 'Procedimento padrão', 25, 221, 1, 1),
(35, '2026-03-12', 'V97E1C43', 'Procedimento padrão', 26, 222, 1, 1),
(36, '2026-03-12', '7D266475', 'Procedimento padrão', 27, 227, 1, 1),
(37, '2026-03-14', '83F9137D', 'Procedimento padrão', 28, 224, 1, 1),
(38, '2026-03-14', 'A7EE4175', 'Procedimento padrão', 29, 214, 1, 1),
(39, '2026-03-15', '91F44441', 'Procedimento padrão', 30, 246, 1, 1),
(40, '2026-03-16', 'DA81F7D3', 'Procedimento padrão', 31, 245, 1, 1),
(41, '2026-03-16', '74E6C8C2', 'Procedimento padrão', 32, 244, 1, 1),
(42, '2026-03-18', '2K6VJD8T', 'Procedimento padrão', 33, 247, 1, 1),
(43, '2026-03-18', 'HAU3NVT1', 'Procedimento padrão', 34, 248, 1, 1),
(44, '2026-03-19', '8DB3D011', 'Procedimento padrão', 30, 241, 1, 1),
(45, '2026-03-25', '5DEU12A2', 'Procedimento padrão', 35, 249, 1, 1),
(46, '2026-03-27', '957C488A', 'Procedimento padrão', 36, 193, 1, 1),
(47, '2026-03-27', 'B0EE1843', 'Procedimento padrão', 37, 259, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `imagens`
--

CREATE TABLE `imagens` (
  `id` int(11) NOT NULL,
  `caminho` varchar(500) NOT NULL,
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `imagens`
--

INSERT INTO `imagens` (`id`, `caminho`, `data_upload`) VALUES
(5, 'src/imagens/itens/20260216_174808_567292.jpg', '2026-02-16 20:48:08'),
(6, 'src/imagens/itens/20260216_175239_567292.jpg', '2026-02-16 20:52:39'),
(7, 'imagens/entregas/20260217_113821_567292.jpg', '2026-02-17 14:38:21'),
(8, 'imagens/entregas/20260217_121619_567292.jpg', '2026-02-17 15:16:19'),
(9, 'imagens/entregas/20260217_125437_567292.jpg', '2026-02-17 15:54:37'),
(10, 'imagens/entregas/20260217_130855_567292.jpg', '2026-02-17 16:08:55'),
(11, 'src/imagens/itens/20260218_181039_567292.jpg', '2026-02-18 21:10:39'),
(12, 'src/imagens/itens/20260218_181138_567292.jpg', '2026-02-18 21:11:38'),
(13, 'src/imagens/itens/20260218_181244_567292.jpg', '2026-02-18 21:12:44'),
(14, 'imagens/entregas/20260218_181610_567292.jpg', '2026-02-18 21:16:10'),
(15, 'imagens/entregas/20260218_182043_567292.jpg', '2026-02-18 21:20:43'),
(16, 'src/imagens/itens/20260220_205349_567292.jpg', '2026-02-20 23:53:49'),
(17, 'src/imagens/itens/20260220_221401_578003.jpg', '2026-02-21 01:14:01'),
(18, 'src/imagens/itens/20260220_221946_578003.jpg', '2026-02-21 01:19:46'),
(19, 'imagens/entregas/20260220_222153_578003.jpg', '2026-02-21 01:21:53'),
(20, 'src/imagens/itens/20260223_000811_3874-controle-de-qualidade-testes.jpg', '2026-02-23 03:08:11'),
(21, 'src/imagens/itens/20260225_103333_567292.jpg', '2026-02-25 13:33:33'),
(22, 'imagens/entregas/20260225_103508_578003.jpg', '2026-02-25 13:35:08'),
(23, 'imagens/entregas/20260225_111131_578003.jpg', '2026-02-25 14:11:31'),
(24, 'src/imagens/itens/20260225_115547_578003.jpg', '2026-02-25 14:55:47'),
(25, 'imagens/entregas/20260225_115634_567292.jpg', '2026-02-25 14:56:34'),
(26, 'imagens/entregas/20260225_221307_578003.jpg', '2026-02-26 01:13:07'),
(27, 'src/imagens/itens/20260305_233942_578003.jpg', '2026-03-06 02:39:42'),
(28, 'src/imagens/itens/20260305_234247_567292.jpg', '2026-03-06 02:42:47'),
(29, 'src/imagens/itens/20260305_235526_567292.jpg', '2026-03-06 02:55:26'),
(30, 'imagens/entregas/20260306_001636_567292.jpg', '2026-03-06 03:16:36'),
(31, 'C:\\Users\\User\\Desktop\\Projeto Mobile\\ProjetoMobileBack\\uploads\\entregas\\imagem-1772822177214-20856354.jpeg', '2026-03-06 18:36:26'),
(32, 'C:\\Users\\User\\Desktop\\Projeto Mobile\\ProjetoMobileBack\\uploads\\entregas\\imagem-1772823704146-385562193.jpeg', '2026-03-06 19:01:58'),
(33, 'C:\\Users\\User\\Desktop\\Projeto Mobile\\ProjetoMobileBack\\uploads\\entregas\\imagem-1772824115291-609904257.jpeg', '2026-03-06 19:08:42'),
(34, 'src/uploads/itens/imagem-1772825546556-516973468.jpeg', '2026-03-06 19:32:30'),
(35, 'src/uploads/itens/imagem-1772828893355-336420887.jpeg', '2026-03-06 20:28:17'),
(36, 'src/uploads/itens/imagem-1772829483089-999214324.jpeg', '2026-03-06 20:38:05'),
(37, 'src/imagens/itens/320f1d3d-70f1-4b68-ae70-5e989a5c07ed.jpeg', '2026-03-06 21:11:29'),
(38, 'src/imagens/itens/fbfc250a-3f57-4d43-b539-9465c37a4995.jpeg', '2026-03-06 21:16:39'),
(39, 'src/imagens/itens/imagem-1772832908358-400174333.jpeg', '2026-03-06 21:35:11'),
(40, 'src/imagens/itens/imagem-1772833135293-560575014.jpeg', '2026-03-06 21:38:55'),
(41, 'src/imagens/itens/imagem-1772833389929-874140243.jpeg', '2026-03-06 21:43:14'),
(42, 'src/imagens/itens/20260306_191627_578003.jpg', '2026-03-06 22:16:27'),
(43, 'src/imagens/itens/imagem-1772835740335-560019073.jpeg', '2026-03-06 22:22:22'),
(44, 'src/imagens/itens/imagem-1772837017583-366447389.jpeg', '2026-03-06 22:43:39'),
(45, 'src/imagens/entregas/imagem-1772905331010-767572854.jpeg', '2026-03-07 17:42:13'),
(46, 'src/imagens/entregas/imagem-1772908444008-284007497.jpeg', '2026-03-07 18:34:07'),
(47, 'src/imagens/itens/imagem-1772986374149-516344454.jpeg', '2026-03-08 16:12:59'),
(48, 'src/imagens/entregas/imagem-1772986807448-341807874.jpeg', '2026-03-08 16:20:10'),
(49, 'src/imagens/itens/imagem-1773100593721-326638110.jpeg', '2026-03-09 23:56:33'),
(50, 'src/imagens/entregas/imagem-1773100849549-172275359.jpeg', '2026-03-10 00:00:49'),
(51, 'imagens/entregas/20260312_144914_578003.jpg', '2026-03-12 17:49:14'),
(52, 'src/imagens/itens/imagem-1773349326612-180203198.jpeg', '2026-03-12 21:02:08'),
(53, 'src/imagens/entregas/imagem-1773349593411-14943098.jpeg', '2026-03-12 21:06:37'),
(54, 'src/imagens/itens/imagem-1773353861394-668435848.jpg', '2026-03-12 22:17:42'),
(55, 'src/imagens/entregas/imagem-1773355032425-503664131.jpg', '2026-03-12 22:37:12'),
(56, 'src/imagens/itens/20260312_203752_WhatsApp Image 2026-03-12 at 20.31.21.jpeg', '2026-03-12 23:37:52'),
(57, 'src/imagens/itens/20260312_204655_WhatsApp Image 2026-03-12 at 20.02.47.jpeg', '2026-03-12 23:46:55'),
(58, 'src/imagens/itens/20260312_210053_WhatsApp Image 2026-03-12 at 20.02.47.jpeg', '2026-03-13 00:00:53'),
(59, 'src/imagens/itens/20260312_210912_WhatsApp Image 2026-03-12 at 20.02.47.jpeg', '2026-03-13 00:09:12'),
(60, 'imagens/entregas/20260312_212823_WhatsApp Image 2026-03-12 at 20.02.47.jpeg', '2026-03-13 00:28:23'),
(61, 'src/imagens/itens/20260314_194225_578003.jpg', '2026-03-14 22:42:25'),
(62, 'src/imagens/itens/20260314_194519_567292.jpg', '2026-03-14 22:45:19'),
(63, 'imagens/entregas/20260314_202048_WhatsApp Image 2026-03-12 at 20.31.21.jpeg', '2026-03-14 23:20:48'),
(64, 'src/imagens/itens/20260315_120444_578003.jpg', '2026-03-15 15:04:44'),
(65, 'src/imagens/itens/20260315_120623_567292.jpg', '2026-03-15 15:06:23'),
(66, 'src/imagens/itens/20260315_120743_WhatsApp Image 2026-03-12 at 20.02.47.jpeg', '2026-03-15 15:07:43'),
(67, 'imagens/entregas/20260315_120936_WhatsApp Image 2026-03-12 at 20.02.47.jpeg', '2026-03-15 15:09:36'),
(68, 'imagens/entregas/20260316_211711_578003.jpg', '2026-03-17 00:17:11'),
(69, 'imagens/entregas/20260316_212128_567292.jpg', '2026-03-17 00:21:28'),
(70, 'src/imagens/itens/imagem-1773876118067-679587427.jpeg', '2026-03-18 23:21:58'),
(71, 'src/imagens/entregas/imagem-1773885223540-436156619.jpeg', '2026-03-19 01:53:44'),
(72, 'src/imagens/itens/imagem-1773885832786-186222949.jpeg', '2026-03-19 02:03:53'),
(73, 'src/imagens/entregas/imagem-1773886379101-775513359.jpeg', '2026-03-19 02:12:59'),
(74, 'imagens/entregas/20260319_180550_567292.jpg', '2026-03-19 21:05:50'),
(75, 'src/imagens/entregas/imagem-1774492782685-491851118.jpeg', '2026-03-26 02:39:42'),
(76, 'src/imagens/itens/20260327_113440_567292.jpg', '2026-03-27 14:34:40'),
(77, 'src/imagens/itens/20260327_113952_578003.jpg', '2026-03-27 14:39:52'),
(78, 'src/imagens/itens/20260327_114121_578003.jpg', '2026-03-27 14:41:21'),
(79, 'src/imagens/itens/20260327_115645_567292.jpg', '2026-03-27 14:56:45'),
(80, 'src/imagens/itens/20260327_125616_567292.jpg', '2026-03-27 15:56:16'),
(81, 'src/imagens/itens/20260327_125715_578003.jpg', '2026-03-27 15:57:15'),
(82, 'src/imagens/itens/20260327_133925_567292.jpg', '2026-03-27 16:39:25'),
(83, 'src/imagens/itens/imagem-1774629931724-154651621.jpeg', '2026-03-27 16:45:32'),
(84, 'src/imagens/itens/20260327_152301_567292.jpg', '2026-03-27 18:23:01'),
(85, 'imagens/entregas/20260327_152812_578003.jpg', '2026-03-27 18:28:12'),
(86, 'src/imagens/itens/imagem-1774640649223-900300928.jpeg', '2026-03-27 19:44:09'),
(87, 'src/imagens/itens/imagem-1774641319445-326636487.jpeg', '2026-03-27 19:55:19'),
(88, 'src/imagens/itens/imagem-1774641696970-850958410.jpeg', '2026-03-27 20:01:37'),
(89, 'src/imagens/itens/imagem-1774641978216-5791491.jpeg', '2026-03-27 20:06:18'),
(90, 'src/imagens/itens/imagem-1774643262675-816523463.jpeg', '2026-03-27 20:27:44');

-- --------------------------------------------------------

--
-- Estrutura para tabela `imagens_entrega`
--

CREATE TABLE `imagens_entrega` (
  `id` int(11) NOT NULL,
  `imagem_id` int(11) NOT NULL,
  `entrega_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `imagens_entrega`
--

INSERT INTO `imagens_entrega` (`id`, `imagem_id`, `entrega_id`) VALUES
(1, 7, 5),
(2, 8, 6),
(3, 9, 8),
(4, 10, 9),
(5, 14, 13),
(6, 15, 14),
(7, 19, 15),
(8, 22, 22),
(9, 23, 23),
(10, 25, 24),
(11, 26, 25),
(12, 30, 28),
(13, 45, 29),
(14, 46, 30),
(15, 48, 31),
(16, 50, 32),
(17, 51, 33),
(18, 53, 34),
(19, 55, 35),
(20, 60, 36),
(21, 63, 37),
(22, 67, 39),
(23, 68, 40),
(24, 69, 41),
(25, 71, 42),
(26, 73, 43),
(27, 74, 44),
(28, 75, 45),
(29, 85, 47);

-- --------------------------------------------------------

--
-- Estrutura para tabela `imagens_item`
--

CREATE TABLE `imagens_item` (
  `id` int(11) NOT NULL,
  `imagem_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `imagens_item`
--

INSERT INTO `imagens_item` (`id`, `imagem_id`, `item_id`) VALUES
(5, 5, 158),
(6, 6, 159),
(7, 11, 166),
(8, 12, 167),
(9, 13, 168),
(10, 16, 171),
(11, 17, 172),
(12, 18, 173),
(13, 20, 174),
(14, 21, 178),
(15, 24, 179),
(16, 27, 191),
(17, 28, 192),
(18, 29, 193),
(19, 31, 194),
(20, 32, 197),
(21, 33, 198),
(22, 34, 199),
(23, 35, 201),
(24, 36, 203),
(25, 37, 204),
(26, 38, 205),
(27, 39, 206),
(28, 40, 207),
(29, 41, 209),
(30, 42, 210),
(31, 43, 211),
(32, 44, 212),
(33, 47, 218),
(34, 49, 219),
(35, 52, 221),
(36, 54, 222),
(37, 56, 224),
(38, 57, 225),
(39, 58, 227),
(40, 59, 231),
(41, 61, 241),
(42, 62, 243),
(43, 64, 244),
(44, 65, 245),
(45, 66, 246),
(46, 70, 247),
(47, 72, 248),
(48, 76, 251),
(49, 77, 252),
(50, 78, 253),
(51, 79, 254),
(52, 80, 255),
(53, 81, 256),
(54, 82, 257),
(55, 83, 258),
(56, 84, 259),
(57, 86, 260),
(58, 87, 261),
(59, 88, 262),
(60, 89, 263),
(61, 90, 264);

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_destinados`
--

CREATE TABLE `itens_destinados` (
  `id` int(11) NOT NULL,
  `data_envio` date NOT NULL,
  `data_inventario` date DEFAULT NULL,
  `item_id` int(11) NOT NULL,
  `destino_id` int(11) NOT NULL,
  `responsavel_encaminhamento` varchar(100) DEFAULT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `itens_destinados`
--

INSERT INTO `itens_destinados` (`id`, `data_envio`, `data_inventario`, `item_id`, `destino_id`, `responsavel_encaminhamento`, `ativo`) VALUES
(1, '2026-02-15', '2026-02-18', 127, 2, NULL, 1),
(2, '2026-02-15', '2026-02-12', 144, 2, NULL, 1),
(3, '2026-02-16', '2026-02-16', 141, 2, NULL, 1),
(4, '2026-02-17', '2026-02-02', 143, 2, NULL, 1),
(5, '2026-02-18', '2026-01-28', 132, 2, NULL, 1),
(6, '2026-02-25', '2026-02-28', 134, 2, NULL, 1),
(7, '2026-02-25', '2026-02-28', 135, 2, NULL, 1),
(8, '2026-02-25', '2026-02-28', 130, 2, NULL, 1),
(9, '2026-03-10', '2026-03-11', 120, 2, NULL, 1),
(10, '2026-03-13', '2026-03-06', 128, 5, NULL, 1),
(11, '2026-03-07', '2026-03-07', 137, 2, NULL, 1),
(12, '2026-03-07', '2026-03-07', 129, 6, NULL, 1),
(13, '2026-03-07', '2026-03-07', 146, 2, NULL, 1),
(14, '2026-03-07', '2026-03-07', 131, 2, NULL, 1),
(15, '2026-03-08', '2026-03-08', 133, 2, NULL, 1),
(16, '2026-03-12', '2026-03-12', 119, 2, NULL, 1),
(17, '2026-03-15', '2026-03-15', 234, 2, NULL, 1),
(18, '2026-03-18', '2026-03-18', 136, 2, NULL, 1),
(19, '2026-03-27', '2026-03-27', 240, 2, 'Karen Braga', 1),
(20, '2026-03-27', '2026-03-27', 239, 2, 'Karen Braga', 1),
(21, '2026-03-27', '2026-03-27', 238, 2, 'Karen Braga', 1),
(22, '2026-03-27', '2026-03-27', 237, 2, 'Karen Braga', 1),
(23, '2026-03-27', '2026-03-27', 236, 2, 'Karen Braga', 1),
(24, '2026-03-28', '2026-03-27', 243, 2, 'Karen Braga', 1),
(25, '2026-03-28', '2026-03-27', 232, 2, 'Karen Braga', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_eletronicos`
--

CREATE TABLE `itens_eletronicos` (
  `id` int(11) NOT NULL,
  `modelo` varchar(55) NOT NULL,
  `item_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `itens_eletronicos`
--

INSERT INTO `itens_eletronicos` (`id`, `modelo`, `item_id`) VALUES
(1, 'Galaxy A10', 1),
(2, 'Gamer', 108),
(3, 'Gamer', 109),
(4, 'Galaxy A32', 110),
(5, '16 pro max', 116),
(6, 'Galaxy A30', 149),
(7, 'note 10', 151),
(8, 'note 10', 154),
(9, 'Note 10', 156),
(10, 'Note 10', 157),
(11, 'Note 10', 158),
(12, 'teste', 161),
(13, 'teste', 167),
(14, 'Note 10', 172),
(15, 'Teste eletronico ', 176),
(16, 'Redmi note 10', 194),
(17, 'Redmi note 10', 197),
(18, 'Redmi note 10', 199),
(19, 'Prateado 8gb', 201),
(20, 'Ranger', 203),
(21, 'Original', 205),
(22, 'Ranger', 209),
(23, 'teste', 213),
(24, 'Smart Magic MR23GA', 218),
(25, 'C3', 219),
(26, 'Yk0203', 222),
(27, 'EMC2341', 224),
(28, 'n/a', 225),
(29, 'n/a', 227),
(30, 'giuyg', 228),
(31, 'n/a', 230),
(32, 'n/a', 231),
(33, 'teste eletronico', 245),
(34, 'Aspire ES 15', 247),
(35, 'N/A', 248),
(36, 'teste', 252),
(37, 'teste', 253),
(38, 'teste', 257),
(39, 'Gamer', 260),
(40, 'LG', 261),
(41, 'Teste', 262),
(42, 'Ps4 sem fio', 264);

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_perdidos`
--

CREATE TABLE `itens_perdidos` (
  `id` int(11) NOT NULL,
  `numero_registro` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `marca` varchar(150) DEFAULT NULL,
  `data_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `numero_lacre` int(11) NOT NULL,
  `estado_conservacao` enum('preservado','desgastado','danificado') NOT NULL,
  `observacao` varchar(350) DEFAULT NULL,
  `nome_entregador` varchar(150) DEFAULT NULL,
  `local_id` int(11) NOT NULL,
  `situacao_id` int(11) NOT NULL,
  `usuario_responsavel_id` int(11) NOT NULL,
  `operador_id` int(11) DEFAULT NULL,
  `assinatura_operador` varchar(150) DEFAULT NULL,
  `tipo_id` int(11) NOT NULL,
  `caixa_id` int(11) DEFAULT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `itens_perdidos`
--

INSERT INTO `itens_perdidos` (`id`, `numero_registro`, `nome`, `marca`, `data_registro`, `numero_lacre`, `estado_conservacao`, `observacao`, `nome_entregador`, `local_id`, `situacao_id`, `usuario_responsavel_id`, `tipo_id`, `caixa_id`, `ativo`) VALUES
(1, 1, 'Celular Samsung Galaxy A10', 'Samsung', '2026-02-06 00:36:18', 1001, 'preservado', 'Bom estado', NULL, 1, 3, 2, 15, 1, 1),
(2, 2, 'Carteira de couro marrom', 'Sem marca', '2026-02-06 00:36:18', 1002, 'preservado', 'Com documentos', NULL, 2, 4, 2, 13, 2, 1),
(3, 3, 'Óculos de sol Ray-Ban', 'Ray-Ban', '2026-02-06 00:36:18', 1003, 'preservado', 'Com estojo', NULL, 3, 4, 2, 9, 5, 1),
(4, 4, 'iPhone X', 'Apple', '2026-02-06 00:53:32', 1004, 'preservado', 'O celular esta com capa preta', NULL, 10, 4, 1, 15, 1, 1),
(5, 5, 'Camiseta Branca', 'Nike', '2026-02-06 02:50:38', 1005, 'preservado', 'esta dentro de uma sacola de compras', NULL, 7, 1, 1, 6, NULL, 1),
(6, 6, 'Notebook Dell Inspiron', 'Dell', '2026-02-06 13:00:00', 1006, 'preservado', 'Preto, carregador incluso', NULL, 1, 1, 2, 1, 1, 1),
(7, 7, 'Tablet Samsung Galaxy Tab', 'Samsung', '2026-02-06 14:15:00', 1007, 'preservado', 'Tela 10 polegadas, com capa', NULL, 3, 1, 3, 1, 1, 1),
(8, 8, 'Fones de ouvido Bluetooth', 'Sony', '2026-02-06 15:30:00', 1008, 'desgastado', 'Cabo desgastado, funciona bem', NULL, 5, 1, 2, 1, 1, 1),
(9, 9, 'Smartwatch Apple Watch', 'Apple', '2026-02-06 17:00:00', 1009, 'preservado', 'Série 6, pulseira esportiva', NULL, 8, 1, 3, 1, 1, 1),
(10, 10, 'Power Bank 10000mAh', 'Xiaomi', '2026-02-06 18:20:00', 1010, 'preservado', 'Preto, com cabo USB', NULL, 10, 1, 2, 1, 1, 1),
(11, 11, 'Câmera Digital Canon', 'Canon', '2026-02-06 19:45:00', 1011, 'preservado', 'Modelo EOS 2000D, com lente', NULL, 2, 1, 3, 1, 1, 1),
(12, 12, 'Mouse sem fio', 'Logitech', '2026-02-07 12:10:00', 1012, 'preservado', 'Preto, com receptor USB', NULL, 4, 1, 2, 1, 1, 1),
(13, 13, 'Caixa de som portátil', 'JBL', '2026-02-07 13:25:00', 1013, 'preservado', 'Flip 5, cor azul', NULL, 6, 1, 3, 1, 1, 1),
(14, 14, 'Carregador iPhone', 'Apple', '2026-02-07 14:40:00', 1014, 'danificado', 'Cabo danificado na ponta', NULL, 7, 1, 2, 1, 1, 1),
(15, 15, 'HD Externo 1TB', 'Seagate', '2026-02-07 16:00:00', 1015, 'preservado', 'Preto, USB 3.0', NULL, 9, 1, 3, 1, 1, 1),
(16, 16, 'Kindle Paperwhite', 'Amazon', '2026-02-07 17:20:00', 1016, 'preservado', 'Com capa protetora', NULL, 1, 1, 2, 1, 1, 1),
(17, 17, 'Controle PlayStation 5', 'Sony', '2026-02-07 18:35:00', 1017, 'preservado', 'Branco, sem carregador', NULL, 3, 1, 3, 1, 1, 1),
(18, 18, 'Roteador Wi-Fi', 'TP-Link', '2026-02-07 19:50:00', 1018, 'preservado', 'Modelo Archer C6', NULL, 5, 1, 2, 1, 1, 1),
(19, 19, 'Calculadora científica', 'Casio', '2026-02-08 12:05:00', 1019, 'desgastado', 'Teclas desgastadas, funciona', NULL, 8, 4, 3, 1, 1, 1),
(20, 20, 'Carregador portátil', 'Anker', '2026-02-08 13:20:00', 1020, 'preservado', '20000mAh, 2 portas USB', NULL, 10, 4, 2, 1, 1, 1),
(21, 21, 'Carteira de Habilitação', NULL, '2026-02-08 14:35:00', 1021, 'preservado', 'Nome: João Silva, categoria B', NULL, 2, 1, 3, 2, 2, 1),
(22, 22, 'Passaporte', NULL, '2026-02-08 15:50:00', 1022, 'preservado', 'Nacionalidade brasileira', NULL, 4, 1, 2, 2, 2, 1),
(23, 23, 'Carteira de Trabalho', NULL, '2026-02-08 17:05:00', 1023, 'desgastado', 'Capa desgastada, páginas intactas', NULL, 6, 1, 3, 2, 2, 1),
(24, 24, 'Certidão de Nascimento', NULL, '2026-02-08 18:20:00', 1024, 'preservado', 'Cópia autenticada', NULL, 7, 1, 2, 2, 2, 1),
(25, 25, 'Título de Eleitor', NULL, '2026-02-08 19:35:00', 1025, 'preservado', 'Com comprovante de votação', NULL, 9, 1, 3, 2, 2, 1),
(26, 26, 'Cartão do SUS', NULL, '2026-02-09 12:00:00', 1026, 'preservado', 'Plástico, com foto', NULL, 1, 1, 2, 2, 2, 1),
(27, 27, 'Certificado de Conclusão', NULL, '2026-02-09 13:15:00', 1027, 'preservado', 'Ensino Médio, com capa', NULL, 3, 1, 3, 2, 2, 1),
(28, 28, 'Contrato de Aluguel', NULL, '2026-02-09 14:30:00', 1028, 'preservado', '3 páginas, assinado', NULL, 5, 1, 2, 2, 2, 1),
(29, 29, 'Receituário médico', NULL, '2026-02-09 15:45:00', 1029, 'preservado', '2 receitas, carimbo do médico', NULL, 8, 1, 3, 2, 2, 1),
(30, 30, 'Comprovante de Residência', NULL, '2026-02-09 17:00:00', 1030, 'preservado', 'Conta de luz, mês atual', NULL, 10, 1, 2, 2, 2, 1),
(31, 31, 'Jaqueta jeans', 'Levis', '2026-02-09 18:15:00', 1031, 'preservado', 'Tamanho M, cor azul', NULL, 2, 1, 3, 6, 4, 1),
(32, 32, 'Vestido longo', 'Zara', '2026-02-09 19:30:00', 1032, 'preservado', 'Estampado, tamanho P', NULL, 4, 1, 2, 6, 4, 1),
(33, 33, 'Calça cargo', 'Nike', '2026-02-10 12:10:00', 1033, 'desgastado', 'Joelhos desgastados, tamanho G', NULL, 6, 1, 3, 6, 4, 1),
(34, 34, 'Blazer social', 'Reserva', '2026-02-10 13:25:00', 1034, 'preservado', 'Preto, tamanho 42', NULL, 7, 1, 2, 6, 4, 1),
(35, 35, 'Shorts esportivo', 'Adidas', '2026-02-10 14:40:00', 1035, 'preservado', 'Cinza, tamanho M', NULL, 9, 1, 3, 6, 4, 1),
(36, 36, 'Cachecol de lã', 'Polo Ralph Lauren', '2026-02-10 16:00:00', 1036, 'preservado', 'Vermelho, 100% lã', NULL, 1, 1, 2, 6, 4, 1),
(37, 37, 'Chapéu de palha', NULL, '2026-02-10 17:15:00', 1037, 'danificado', 'Aba quebrada, ainda usável', NULL, 3, 1, 3, 6, 4, 1),
(38, 38, 'Luvas de couro', NULL, '2026-02-10 18:30:00', 1038, 'preservado', 'Marrom, tamanho M', NULL, 5, 1, 2, 6, 4, 1),
(39, 39, 'Pijama infantil', 'Disney', '2026-02-10 19:45:00', 1039, 'preservado', 'Estampa Mickey, tamanho 6', NULL, 8, 1, 3, 6, 4, 1),
(40, 40, 'Cinto de couro', 'Diesel', '2026-02-11 12:20:00', 1040, 'desgastado', 'Fivela oxidada, couro bom', NULL, 10, 1, 2, 6, 4, 1),
(41, 41, 'Bolsa transversal', 'Gucci', '2026-02-11 13:35:00', 1041, 'preservado', 'Couro marrom, com alça', NULL, 2, 1, 3, 7, 5, 1),
(42, 42, 'Mochila escolar', 'Adidas', '2026-02-11 14:50:00', 1042, 'desgastado', 'Zíper quebrado, livros dentro', NULL, 4, 1, 2, 7, 5, 1),
(43, 43, 'Necessaire feminina', 'Nina Ricci', '2026-02-11 16:05:00', 1043, 'preservado', 'Com maquiagem', NULL, 6, 1, 3, 7, 5, 1),
(44, 44, 'Porta-documentos', NULL, '2026-02-11 17:20:00', 1044, 'preservado', 'Preto, com documentos', NULL, 7, 1, 2, 7, 5, 1),
(45, 45, 'Estojo de lápis', 'Faber-Castell', '2026-02-11 18:35:00', 1045, 'preservado', 'Com material escolar', NULL, 9, 1, 3, 7, 5, 1),
(46, 46, 'Guarda-chuva', NULL, '2026-02-11 19:50:00', 1046, 'danificado', 'Uma haste quebrada', NULL, 1, 1, 2, 7, 5, 1),
(47, 47, 'Carteira masculina', 'Hugo Boss', '2026-02-12 12:25:00', 1047, 'preservado', 'Couro preto, com cartões', NULL, 3, 1, 3, 7, 5, 1),
(48, 48, 'Lenço de seda', 'Hermès', '2026-02-12 13:40:00', 1048, 'preservado', 'Estampa floral, azul', NULL, 5, 1, 2, 7, 5, 1),
(49, 49, 'Pochete', 'Nike', '2026-02-12 14:55:00', 1049, 'preservado', 'Preta, ajustável', NULL, 8, 1, 3, 7, 5, 1),
(50, 50, 'Capacete de bicicleta', 'Giro', '2026-02-12 16:10:00', 1050, 'preservado', 'Tamanho M, preto com detalhes vermelhos', NULL, 10, 1, 2, 7, 5, 1),
(51, 51, 'Óculos de grau', 'Oakley', '2026-02-12 17:25:00', 1051, 'preservado', 'Grau -2.0, armação preta', NULL, 2, 1, 3, 8, 5, 1),
(52, 52, 'Óculos de natação', 'Speedo', '2026-02-12 18:40:00', 1052, 'preservado', 'Azul, com case', NULL, 4, 1, 2, 8, 5, 1),
(53, 53, 'Óculos de ciclismo', 'Oakley', '2026-02-12 19:55:00', 1053, 'desgastado', 'Lentes riscadas', NULL, 6, 1, 3, 8, 5, 1),
(54, 54, 'Óculos de sol aviador', 'Ray-Ban', '2026-02-13 12:30:00', 1054, 'preservado', 'Dourado, lentes verdes', NULL, 7, 1, 2, 8, 5, 1),
(55, 55, 'Óculos de leitura', NULL, '2026-02-13 13:45:00', 1055, 'preservado', 'Grau +1.5, sem marca', NULL, 9, 1, 3, 8, 5, 1),
(56, 56, 'Chave de casa', NULL, '2026-02-13 15:00:00', 1056, 'preservado', 'Chave Yale, com chaveiro', NULL, 1, 1, 2, 9, 5, 1),
(57, 57, 'Chave de carro', 'Toyota', '2026-02-13 16:15:00', 1057, 'preservado', 'Com controle remoto', NULL, 3, 1, 3, 9, 5, 1),
(58, 58, 'Chaveiro personalizado', NULL, '2026-02-13 17:30:00', 1058, 'preservado', 'Com foto e 3 chaves', NULL, 5, 1, 2, 9, 5, 1),
(59, 59, 'Chave de escritório', NULL, '2026-02-13 18:45:00', 1059, 'preservado', 'Chave tetra, codificada', NULL, 8, 1, 3, 9, 5, 1),
(60, 60, 'Chave de bicicleta', 'Abus', '2026-02-13 20:00:00', 1060, 'preservado', 'Cadeado U-lock', NULL, 10, 1, 2, 9, 5, 1),
(61, 61, 'Anel de ouro', 'Vivara', '2026-02-14 12:15:00', 1061, 'preservado', '18k, tamanho 15', NULL, 2, 1, 3, 10, 5, 1),
(62, 62, 'Colar de prata', 'Pandora', '2026-02-14 13:30:00', 1062, 'preservado', 'Com pingente coração', NULL, 4, 1, 2, 10, 5, 1),
(63, 63, 'Pulseira de tennis', NULL, '2026-02-14 14:45:00', 1063, 'desgastado', 'Ouro branco, com marcas de uso', NULL, 6, 1, 3, 10, 5, 1),
(64, 64, 'Brinco de pérola', 'Chanel', '2026-02-14 16:00:00', 1064, 'preservado', 'Pérola única, ouro', NULL, 7, 1, 2, 10, 5, 1),
(65, 65, 'Relógio de pulso', 'Casio', '2026-02-14 17:15:00', 1065, 'preservado', 'Modelo G-Shock, preto', NULL, 9, 1, 3, 10, 5, 1),
(66, 66, 'Boneca Barbie', 'Mattel', '2026-02-14 18:30:00', 1066, 'preservado', 'Com roupas extras', NULL, 1, 1, 2, 11, 3, 1),
(67, 67, 'Carrinho de bebê', 'Graco', '2026-02-14 19:45:00', 1067, 'preservado', 'Compacto, azul', NULL, 3, 1, 3, 11, 3, 1),
(68, 68, 'Mamadeira', 'Avent', '2026-02-15 12:20:00', 1068, 'preservado', '250ml, nova', NULL, 5, 1, 2, 11, 3, 1),
(69, 69, 'Chupeta', 'Nuk', '2026-02-15 13:35:00', 1069, 'preservado', 'Orto, cor azul', NULL, 8, 1, 3, 11, 3, 1),
(70, 70, 'Toalha infantil', 'Disney', '2026-02-15 14:50:00', 1070, 'preservado', 'Estampa Frozen', NULL, 10, 1, 2, 11, 3, 1),
(71, 71, 'Carrinho Hot Wheels', 'Mattel', '2026-02-15 16:05:00', 1071, 'preservado', 'Coleção especial', NULL, 2, 1, 3, 12, 3, 1),
(72, 72, 'Lego Star Wars', 'Lego', '2026-02-15 17:20:00', 1072, 'preservado', 'Millennium Falcon, 7541 peças', NULL, 4, 1, 2, 12, 3, 1),
(73, 73, 'Quebra-cabeça', 'Ravensburger', '2026-02-15 18:35:00', 1073, 'preservado', '1000 peças, paisagem', NULL, 6, 1, 3, 12, 3, 1),
(74, 74, 'Bola de futebol', 'Nike', '2026-02-15 19:50:00', 1074, 'desgastado', 'Desgastada, ainda inflada', NULL, 7, 1, 2, 12, 3, 1),
(75, 75, 'Jogo de tabuleiro', 'Estrela', '2026-02-16 12:25:00', 1075, 'preservado', 'Banco Imobiliário, completo', NULL, 9, 1, 3, 12, 3, 1),
(76, 76, 'Sacola de supermercado', 'Carrefour', '2026-02-16 13:40:00', 1076, 'preservado', 'Com produtos alimentícios', NULL, 1, 1, 2, 13, 3, 1),
(77, 77, 'Sacola de loja', 'Renner', '2026-02-16 14:55:00', 1077, 'preservado', 'Com roupa nova e nota fiscal', NULL, 3, 1, 3, 13, 3, 1),
(78, 78, 'Sacola de farmácia', 'Droga Raia', '2026-02-16 16:10:00', 1078, 'preservado', 'Com medicamentos', NULL, 5, 1, 2, 13, 3, 1),
(79, 79, 'Sacola térmica', NULL, '2026-02-16 17:25:00', 1079, 'preservado', 'Com alimentos congelados', NULL, 8, 1, 3, 13, 3, 1),
(80, 80, 'Mochila de compras', 'Nike', '2026-02-16 18:40:00', 1080, 'preservado', 'Reutilizável, com compras', NULL, 10, 1, 2, 13, 3, 1),
(81, 81, 'Kit primeiros socorros', NULL, '2026-02-16 19:55:00', 1081, 'preservado', 'Bandagens, antisséptico', NULL, 2, 1, 3, 14, 3, 1),
(82, 82, 'Medicamento controlado', 'Pfizer', '2026-02-17 12:30:00', 1082, 'preservado', 'Receita médica incluída', NULL, 4, 1, 2, 14, 3, 1),
(83, 83, 'Vitaminas', 'Centrum', '2026-02-17 13:45:00', 1083, 'preservado', 'Frasco fechado', NULL, 6, 1, 3, 14, 3, 1),
(84, 84, 'Analgésicos', 'Neosaldina', '2026-02-17 15:00:00', 1084, 'preservado', 'Cartela com 10 comprimidos', NULL, 7, 1, 2, 14, 3, 1),
(85, 85, 'Antialérgico', 'Allegra', '2026-02-17 16:15:00', 1085, 'preservado', 'Embalagem original', NULL, 9, 1, 3, 14, 3, 1),
(86, 86, 'Lancheira escolar', NULL, '2026-02-17 17:30:00', 1086, 'preservado', 'Com sanduíche e fruta', NULL, 1, 4, 2, 15, 3, 1),
(87, 87, 'Garrafa térmica', 'Stanley', '2026-02-17 18:45:00', 1087, 'preservado', 'Com café ainda quente', NULL, 3, 4, 3, 15, 3, 1),
(88, 88, 'Saco de pão', NULL, '2026-02-17 20:00:00', 1088, 'preservado', 'Pão integral, meio pacote', NULL, 5, 3, 2, 15, 3, 1),
(89, 89, 'Barra de cereal', 'Nutry', '2026-02-18 12:15:00', 1089, 'preservado', 'Pacote com 5 unidades', NULL, 8, 4, 3, 15, 3, 1),
(90, 90, 'Iogurte', 'Danone', '2026-02-18 13:30:00', 1090, 'preservado', 'Morango, validade próxima', NULL, 10, 4, 2, 15, 3, 1),
(91, 91, 'Livro \"A Arte da Guerra\"', 'Ed. Martin Claret', '2026-02-18 14:45:00', 1091, 'preservado', 'Capa dura, em bom estado', NULL, 2, 1, 3, 2, 2, 1),
(92, 92, 'Caneta tinteiro', 'Parker', '2026-02-18 16:00:00', 1092, 'preservado', 'Ouro, com estojo', NULL, 4, 1, 2, 7, 5, 1),
(93, 93, 'Caderno universitário', 'Tilibra', '2026-02-18 17:15:00', 1093, 'preservado', '10 matérias, usado', NULL, 6, 1, 3, 2, 2, 1),
(94, 94, 'Garrafa de água', 'Camelbak', '2026-02-18 18:30:00', 1094, 'preservado', '750ml, cor azul', NULL, 7, 1, 2, 7, 5, 1),
(95, 95, 'Ferramentas', 'Tramontina', '2026-02-18 19:45:00', 1095, 'preservado', 'Chave de fenda e philips', NULL, 9, 1, 3, 1, 1, 1),
(96, 96, 'CDs de música', 'Vários', '2026-02-19 12:20:00', 1096, 'desgastado', '3 CDs, capas danificadas', NULL, 1, 1, 2, 1, 1, 1),
(97, 97, 'DVDs filmes', 'Vários', '2026-02-19 13:35:00', 1097, 'preservado', '5 DVDs, alguns ainda lacrados', NULL, 3, 1, 3, 1, 1, 1),
(98, 98, 'Jornal do dia', 'Folha de S.Paulo', '2026-02-19 14:50:00', 1098, 'preservado', 'Edição completa', NULL, 5, 1, 2, 2, 2, 1),
(99, 99, 'Revista Veja', 'Abril', '2026-02-19 16:05:00', 1099, 'preservado', 'Edição da semana', NULL, 8, 1, 3, 2, 2, 1),
(100, 100, 'Álbum de fotos', NULL, '2026-02-19 17:20:00', 1100, 'preservado', 'Fotos familiares, capa personalizada', NULL, 10, 1, 2, 7, 5, 1),
(101, 101, 'Óculos de realidade virtual', 'Oculus', '2026-02-19 18:35:00', 1101, 'preservado', 'Quest 2, com controles', NULL, 2, 4, 3, 1, 1, 1),
(102, 102, 'Drone', 'DJI', '2026-02-19 19:50:00', 1102, 'preservado', 'Mini 2, com case', NULL, 4, 4, 2, 1, 1, 1),
(103, 103, 'Console portátil', 'Nintendo', '2026-02-20 12:25:00', 1103, 'preservado', 'Switch Lite, amarelo', NULL, 6, 4, 3, 1, 1, 1),
(104, 104, 'Kit maquiagem', 'MAC', '2026-02-20 13:40:00', 1104, 'preservado', 'Com pincéis e produtos', NULL, 7, 4, 2, 7, 5, 1),
(105, 105, 'Instrumento musical', 'Yamaha', '2026-02-20 14:55:00', 1105, 'preservado', 'Flauta doce, soprano', NULL, 9, 4, 3, 1, 1, 1),
(106, 106, 'Relogio', 'Apple', '2026-02-10 13:30:19', 1106, 'preservado', 'com adesivo atrás escrito Marcos', NULL, 10, 1, 1, 1, 1, 1),
(107, 107, 'Pulseira', '', '2026-02-10 13:39:04', 1107, 'preservado', 'Ainda esta na embalagem', NULL, 5, 1, 1, 7, 4, 1),
(108, 108, 'Kit teclado e mouse', 'Fortrek G', '2026-02-10 13:51:17', 1108, 'preservado', '', NULL, 8, 1, 1, 1, 1, 1),
(109, 109, 'Monitor 24 polegadas', 'Acer', '2026-02-10 14:04:27', 1109, 'preservado', 'Na caixa e lacrado', NULL, 9, 1, 1, 1, 1, 1),
(110, 110, 'Celular', 'Samsumg', '2026-02-10 14:09:53', 1110, 'preservado', '', NULL, 10, 1, 1, 1, 1, 1),
(111, 111, 'relogio', 'samsumg', '2026-02-10 14:13:23', 1231, 'preservado', 'riscado', NULL, 5, 1, 1, 3, NULL, 1),
(112, 112, 'teste', 'teste', '2026-02-10 14:29:31', 1234, 'preservado', 'teste', NULL, 1, 1, 1, 7, 4, 1),
(113, 113, 'teste2', 'teste2', '2026-02-10 14:49:11', 4657, 'preservado', 'teste2', NULL, 2, 1, 1, 5, 3, 1),
(114, 114, 'teste3', 'teste3', '2026-02-10 14:54:00', 1253, 'preservado', 'test3,teste3', NULL, 1, 1, 2, 1, 1, 1),
(115, 115, 'teste4', 'teste4', '2026-02-10 15:07:17', 7654, 'preservado', 'teste4', NULL, 6, 4, 1, 9, 3, 1),
(116, 116, 'iphone 16 pro max', 'Apple', '2026-02-14 23:04:04', 1254, 'preservado', 'o celular esta com capa preta', NULL, 10, 4, 1, 10, 1, 1),
(117, 117, 'teste', 'teste', '2026-02-15 14:32:05', 1203, 'preservado', 'teste', NULL, 7, 4, 1, 6, 2, 1),
(118, 118, 'Lancheira com sanduíche', 'Tupperware', '2026-02-10 11:30:00', 1180, 'preservado', 'Sanduíche natural e suco', NULL, 1, 3, 2, 15, 3, 1),
(119, 119, 'Salada de frutas', NULL, '2026-02-05 15:15:00', 1181, 'danificado', 'Embalagem aberta, alimento estragado', NULL, 3, 5, 3, 15, 3, 1),
(120, 120, 'Iogurte grego', 'Vigor', '2026-02-01 12:45:00', 1182, 'danificado', 'Vencido há 5 dias', NULL, 5, 5, 2, 15, 3, 1),
(121, 121, 'Pão de forma', 'Pullman', '2026-02-12 19:20:00', 1183, 'preservado', 'Pacote fechado, validade amanhã', NULL, 7, 3, 3, 15, 3, 1),
(122, 122, 'Sushi', NULL, '2026-02-03 22:30:00', 1184, 'danificado', 'Mau cheiro, impróprio para consumo', NULL, 2, 5, 2, 15, 3, 1),
(123, 123, 'Bolo de chocolate', 'Nestlé', '2026-02-13 17:10:00', 1185, 'preservado', 'Embalado, fatia de bolo', NULL, 4, 3, 3, 15, 3, 1),
(124, 124, 'Leite integral', 'Itambé', '2026-02-02 13:05:00', 1186, 'danificado', 'Caixa estufada, vencido', NULL, 6, 5, 2, 15, 3, 1),
(125, 125, 'Frango assado', NULL, '2026-02-04 21:45:00', 1187, 'danificado', 'Com sinais de deterioração', NULL, 8, 5, 3, 15, 3, 1),
(126, 126, 'Sanduíche natural', 'Subway', '2026-02-14 16:20:00', 1188, 'preservado', 'Feito hoje, ainda fresco', NULL, 9, 3, 2, 15, 3, 1),
(127, 127, 'Sobremesa de pote', NULL, '2026-02-06 18:35:00', 1189, 'danificado', 'Com mofo aparente', NULL, 10, 5, 3, 15, 3, 1),
(128, 128, 'Morangos embalados', NULL, '2026-02-01 13:30:00', 1190, 'danificado', 'Com bolor e partes podres', NULL, 2, 5, 2, 15, 3, 1),
(129, 129, 'Peito de peru fatiado', 'Sadia', '2026-02-02 17:20:00', 1191, 'danificado', 'Embalagem aberta, cheiro azedo', NULL, 4, 5, 3, 15, 3, 1),
(130, 130, 'Creme de leite', 'Nestlé', '2026-01-30 12:15:00', 1192, 'danificado', 'Caixa estufada, produto talhado', NULL, 6, 5, 2, 15, 3, 1),
(131, 131, 'Salame fatiado', NULL, '2026-02-03 19:45:00', 1193, 'danificado', 'Com manchas esbranquiçadas e cheiro forte', NULL, 8, 5, 3, 15, 3, 1),
(132, 132, 'Pão de queijo congelado', 'Forno de Minas', '2026-01-28 14:30:00', 1194, 'danificado', 'Descongelado e recongelado, impróprio', NULL, 10, 5, 2, 15, 3, 1),
(133, 133, 'Suco de uva integral', 'Aurora', '2026-02-04 16:50:00', 1195, 'danificado', 'Garrafa aberta, com fermentação', NULL, 1, 5, 3, 15, 3, 1),
(134, 134, 'Queijo minas', NULL, '2026-02-01 11:20:00', 1196, 'danificado', 'Com mofo e textura alterada', NULL, 3, 5, 2, 15, 3, 1),
(135, 135, 'Presunto cozido', 'Perdigão', '2026-01-31 20:10:00', 1197, 'danificado', 'Embalagem estufada, viscoso', NULL, 5, 5, 3, 15, 3, 1),
(136, 136, 'Tomates cereja', NULL, '2026-02-05 15:40:00', 1198, 'danificado', 'Murchos e com manchas escuras', NULL, 7, 5, 2, 15, 3, 1),
(137, 137, 'Nata', 'Itambé', '2026-02-02 18:30:00', 1199, 'danificado', 'Com bolor na superfície', NULL, 9, 5, 3, 15, 3, 1),
(138, 138, 'Sanduíche natural', 'Santa Clara', '2026-02-15 12:30:00', 1200, 'danificado', 'Maionese azeda, pão murcho', NULL, 1, 3, 2, 15, 3, 1),
(139, 139, 'Salada de frutas', NULL, '2026-02-15 17:20:00', 1201, 'danificado', 'Frutas fermentadas, com líquido turvo', NULL, 3, 3, 3, 15, 3, 1),
(140, 140, 'Iogurte proteico', 'Vigor', '2026-02-16 13:15:00', 1202, 'danificado', 'Pote estufado, produto separado', NULL, 5, 3, 2, 15, 3, 1),
(141, 141, 'Wrap de frango', NULL, '2026-02-16 19:45:00', 1210, 'danificado', 'Mau cheiro, alface murcha', NULL, 7, 5, 3, 15, 3, 1),
(142, 142, 'Suco detox', 'Do Bem', '2026-02-17 14:30:00', 1204, 'danificado', 'Garrafa aberta, com bolor', NULL, 9, 3, 2, 15, 3, 1),
(143, 143, 'Bolo de cenoura', NULL, '2026-02-17 18:50:00', 1205, 'danificado', 'Com mofo visível na cobertura', NULL, 2, 5, 3, 15, 3, 1),
(144, 144, 'Queijo quark', 'President', '2026-02-18 11:40:00', 1206, 'danificado', 'Com bolor e cheiro ácido', NULL, 4, 5, 2, 15, 3, 1),
(145, 145, 'Pão integral', 'Seven Boys', '2026-02-18 16:20:00', 1207, 'danificado', 'Com bolor esverdeado', NULL, 6, 3, 3, 15, 3, 1),
(146, 146, 'Sopa pronta', NULL, '2026-02-19 13:10:00', 1208, 'danificado', 'Embalagem estufada, com fermentação', NULL, 8, 5, 2, 15, 3, 1),
(147, 147, 'Pudim de leite', 'Nestlé', '2026-02-19 19:30:00', 1209, 'danificado', 'Com bolor na superfície, textura alterada', NULL, 10, 3, 3, 15, 3, 1),
(149, 148, 'Celular Galaxy A30', 'Samsumg', '2026-02-16 13:16:41', 1458, 'preservado', 'a capa transparente esta um pouco suja', NULL, 3, 4, 1, 1, 1, 1),
(150, 149, 'teste', 'teste', '2026-02-16 18:15:40', 2001, 'preservado', 'teste', NULL, 4, 4, 1, 2, 3, 1),
(151, 150, 'celular redmi note 10', 'redmi', '2026-02-16 20:10:03', 2002, 'preservado', 'esta com capa preta e sem pelicula na tela', NULL, 2, 4, 1, 1, 1, 1),
(152, 151, 'celular redmi note 10 teste2', 'redmi', '2026-02-16 20:20:25', 2003, 'preservado', 'com capa preta sem pelicula', NULL, 10, 4, 1, 1, 1, 1),
(154, 152, 'celular redmi note 10', 'Redmi', '2026-02-16 20:29:02', 2004, 'preservado', 'capa preta sem pelicula', NULL, 5, 4, 1, 1, 1, 1),
(156, 153, 'celular redmi note 10 teste final', 'Redmi', '2026-02-16 20:34:58', 2005, 'preservado', 'capa preta sem pelicula', NULL, 2, 1, 1, 1, NULL, 1),
(157, 154, 'celular redmi note 10 TESTE FINAL', 'Redmi', '2026-02-16 20:45:22', 2006, 'preservado', 'capa preta sem pelicula', NULL, 5, 1, 1, 1, 1, 1),
(158, 155, 'celular TESTE DE FOTO', 'Redmi', '2026-02-16 20:48:08', 2007, 'preservado', 'capa preta sem pelicula', NULL, 1, 4, 1, 1, NULL, 1),
(159, 156, 'teste de repetição de pasta', 'teste', '2026-02-16 20:52:39', 2008, 'preservado', 'teste de repetição de pasta', NULL, 5, 1, 1, 2, 3, 1),
(160, 157, 'teste cadastro generico', 'teste', '2026-02-17 16:09:54', 2010, 'preservado', 'teste', NULL, 3, 1, 1, 2, 3, 1),
(161, 158, 'teste cadastro eletronico', 'teste', '2026-02-17 16:10:41', 2011, 'desgastado', 'teste', NULL, 1, 1, 1, 2, 3, 1),
(162, 159, 'teste cadastro vestuario', 'teste', '2026-02-17 16:11:53', 2012, 'danificado', 'teste', NULL, 8, 1, 1, 6, 4, 1),
(164, 160, 'Iphone 15 teste', 'teste', '2026-02-17 22:34:00', 1235, 'preservado', 'teste', NULL, 4, 4, 1, 1, 1, 1),
(165, 161, 'teste de requisiçao sem mudar para devolução', 'teste', '2026-02-17 22:55:52', 900, 'preservado', 'teste', NULL, 1, 1, 1, 2, 3, 1),
(166, 162, 'teste generico 2', 'teste', '2026-02-18 21:10:39', 3000, 'preservado', 'teste', NULL, 3, 1, 1, 7, 4, 1),
(167, 163, 'teste eletronico 2', 'teste', '2026-02-18 21:11:38', 3001, 'desgastado', 'teste', NULL, 10, 3, 1, 15, 5, 1),
(168, 164, 'teste vestuario 2', 'teste', '2026-02-18 21:12:44', 3002, 'danificado', 'teste', NULL, 5, 1, 1, 2, 4, 1),
(171, 165, 'teste detalhes', 'teste', '2026-02-20 23:53:49', 4001, 'preservado', 'teste', NULL, 10, 4, 1, 4, 1, 1),
(172, 166, 'celular teste foto', 'Redmi', '2026-02-21 01:14:01', 4002, 'preservado', 'teste de foto na janela detalhes', NULL, 5, 1, 1, 1, 1, 1),
(173, 167, 'teste de foto janela detalhes 2', 'teste', '2026-02-21 01:19:46', 4003, 'preservado', 'teste de foto janela detalhes 2', NULL, 2, 1, 1, 1, 1, 1),
(174, 168, 'teste de cadastro', 'teste', '2026-02-23 03:08:11', 5000, 'preservado', 'teste de cadasto', NULL, 7, 4, 1, 9, 4, 1),
(175, 169, 'Teste mobile', 'Teste', '2026-02-25 00:00:21', 5001, 'preservado', 'Teste mobile', NULL, 5, 1, 1, 2, 2, 1),
(176, 170, 'Teste mobile eletronico', 'Teste eletronico', '2026-02-25 00:02:28', 5002, 'desgastado', 'Teste eletronico do mobile', NULL, 6, 4, 1, 1, 1, 1),
(177, 171, 'Teste Vestuario mobile', 'Teste mobile', '2026-02-25 00:06:15', 5003, 'danificado', 'Teste vestuario mobile', NULL, 1, 1, 1, 6, 4, 1),
(178, 172, 'teste de duas fotos', 'teste', '2026-02-25 13:33:33', 5004, 'preservado', 'teste de duas fotos', NULL, 5, 4, 1, 12, 2, 1),
(179, 173, 'teste de duas fotos 2', 'teste', '2026-02-25 14:55:47', 5005, 'preservado', 'teste de duas fotos 2', NULL, 3, 4, 1, 12, 2, 1),
(180, 174, 'Teste de atualizaçao mobile', 'Teste mobile', '2026-02-26 15:16:29', 7001, 'preservado', 'Teste de atualizaçao mobile', NULL, 1, 1, 1, 3, 2, 1),
(181, 175, 'bolsa de couro', 'nao tem marca', '2026-03-03 01:08:26', 7002, 'preservado', 'bolsa de couro sem marca', NULL, 5, 1, 1, 5, 5, 1),
(182, 176, 'Cartao de credito nubank Kevin Braga', 'Nubank', '2026-03-03 01:12:08', 7003, 'preservado', 'Cartao de credito nubank Kevin Braga', NULL, 1, 1, 1, 3, 4, 1),
(183, 177, 'Teste de Requisição Mobile', 'Teste', '2026-03-05 00:27:44', 7004, 'preservado', 'Teste Requisição Mobile', NULL, 6, 4, 1, 2, 2, 1),
(186, 178, 'teste local novo', 'teste', '2026-03-06 01:29:41', 7005, 'preservado', 'teste local novo', NULL, 11, 1, 1, 5, 3, 1),
(187, 179, 'teste local novo 2', 'teste', '2026-03-06 01:35:32', 7006, 'preservado', 'teste local novo 2', NULL, 12, 1, 1, 2, 4, 1),
(188, 180, 'teste local novo 3', 'teste', '2026-03-06 01:36:21', 7007, 'preservado', 'teste local novo 2', NULL, 13, 1, 1, 2, 4, 1),
(189, 181, 'teste local novo 4', 'teste', '2026-03-06 01:38:31', 7008, 'preservado', 'teste local novo 4', NULL, 14, 1, 1, 12, 5, 1),
(190, 182, 'teste local novo 5', 'teste', '2026-03-06 01:44:34', 7009, 'danificado', 'teste local novo 5', NULL, 15, 1, 1, 9, 4, 1),
(191, 183, 'teste novo local, tipo, caixa', 'teste', '2026-03-06 02:39:42', 7010, 'preservado', 'teste novo local, tipo, caixa', NULL, 18, 4, 1, 16, 6, 1),
(192, 184, 'teste novo local, tipo, caixa 2', 'teste', '2026-03-06 02:42:47', 7011, 'desgastado', 'teste novo local, tipo, caixa 2', NULL, 19, 4, 1, 17, 7, 1),
(193, 185, 'teste novo local, tipo, caixa 3', 'teste', '2026-03-06 02:55:26', 7012, 'danificado', 'teste novo local, tipo, caixa 3', NULL, 15, 4, 1, 16, 7, 1),
(194, 186, 'Celular Xiaomi', 'Xiaomi', '2026-03-06 18:36:14', 8010, 'preservado', 'Capa preta sem pelicula', NULL, 14, 1, 1, 1, 1, 1),
(197, 187, 'Celular Xiaomi', 'Xiaomi', '2026-03-06 19:01:43', 8011, 'preservado', 'Capa preta sem pelicula', NULL, 14, 1, 1, 1, 1, 1),
(198, 188, 'Chaves teste', NULL, '2026-03-06 19:08:35', 8012, 'preservado', 'Teste', NULL, 5, 1, 1, 9, 3, 1),
(199, 189, 'Celular ', 'Xiaomi', '2026-03-06 19:32:26', 8013, 'preservado', 'Com capa preta e srm pelicula e tela intacta', NULL, 5, 1, 1, 1, 1, 1),
(201, 190, 'Ipod', 'Apple', '2026-03-06 20:28:12', 8014, 'preservado', 'Com alguns riscos atrás ', NULL, 17, 1, 1, 1, 1, 1),
(203, 191, 'Mouse gamer', 'Fortrek G', '2026-03-06 20:38:03', 8015, 'preservado', 'Sem defeitos', NULL, 15, 1, 1, 2, 1, 1),
(204, 192, 'Chaves', NULL, '2026-03-06 21:11:28', 8016, 'preservado', '2 chaves com chaveiro', NULL, 2, 1, 1, 9, 3, 1),
(205, 193, 'Controle ps4', 'Sony', '2026-03-06 21:16:37', 8017, 'preservado', 'Cor preto original ', NULL, 8, 1, 1, 1, 1, 1),
(206, 194, 'Enfeite Guitarra', NULL, '2026-03-06 21:35:08', 8018, 'preservado', 'Cordas meio soltas', NULL, 16, 1, 1, 12, 3, 1),
(207, 195, 'Jogos variados ps4', 'Ps4', '2026-03-06 21:38:55', 8019, 'preservado', 'Nao estao lacrados', NULL, 1, 1, 1, 16, 3, 1),
(209, 196, 'Teclado gamer', 'Fortrek G', '2026-03-06 21:43:09', 8020, 'preservado', 'Teclado gamer  novo com todas as teclas', NULL, 15, 1, 1, 1, 1, 1),
(210, 197, 'teste foto pasta para qualquer maquina', 'teste', '2026-03-06 22:16:27', 8021, 'preservado', 'teste foto pasta para qualquer maquina', NULL, 15, 1, 1, 2, 3, 1),
(211, 198, 'Cards de pokemon ', NULL, '2026-03-06 22:22:20', 8022, 'preservado', 'Cards de pokemon novos', NULL, 2, 1, 1, 12, 3, 1),
(212, 199, 'Tênis ', 'Vanscy', '2026-03-06 22:43:37', 8023, 'desgastado', 'Par de tênis azul jeans', NULL, 9, 4, 1, 6, 4, 1),
(213, 200, 'Celular', 'teste', '2026-03-07 15:45:52', 8024, 'preservado', 'Celular teste de notificação de requisição', NULL, 15, 1, 1, 1, 1, 1),
(214, 201, 'teste', 'teste', '2026-03-07 16:17:12', 8025, 'preservado', 'celular teste de notificação de requisição', NULL, 5, 4, 1, 2, 2, 1),
(215, 202, 'teste', 'teste', '2026-03-07 16:21:05', 8026, 'preservado', 'kevin', NULL, 1, 1, 1, 2, 2, 1),
(216, 203, 'teste', 'teste', '2026-03-07 16:28:27', 8027, 'preservado', 'carteira de couro marrom com documentos', NULL, 2, 1, 1, 13, 3, 1),
(217, 204, 'Teste 5 trilhoes', 'Teste', '2026-03-08 03:15:06', 90034, 'danificado', 'Teste 5 trilhoes', NULL, 15, 4, 1, 10, 3, 1),
(218, 205, 'Controle de tv', 'LG', '2026-03-08 16:12:54', 8028, 'preservado', 'Controle preto lg com 2 pilhas', NULL, 16, 4, 1, 1, 1, 1),
(219, 206, 'Caixa de som fantasma branco', 'Amethyst', '2026-03-09 23:56:33', 8029, 'preservado', 'Sem cabos de energia', NULL, 14, 4, 1, 1, 1, 1),
(220, 207, 'teste', 'teste', '2026-03-12 18:59:59', 8030, 'preservado', 'teste', NULL, 14, 1, 1, 9, 5, 1),
(221, 208, 'Teclado ', 'Teste', '2026-03-12 21:02:06', 540568, 'preservado', 'Teste', NULL, 12, 4, 1, 1, 1, 1),
(222, 209, 'Controle de led ', 'Rf wireless', '2026-03-12 22:17:41', 8888888, 'preservado', NULL, NULL, 3, 4, 1, 1, 1, 1),
(223, 210, 'teste', 'teste', '2026-03-12 22:29:44', 67586, 'preservado', 'bolsa couro', NULL, 5, 1, 1, 5, 2, 1),
(224, 211, 'ipod', 'apple', '2026-03-12 23:37:52', 88888, 'desgastado', 'ipod riscado', NULL, 10, 4, 1, 1, 1, 1),
(225, 212, 'fone', 'sem marca', '2026-03-12 23:46:55', 999999, 'preservado', 'fone vermelho', NULL, 3, 1, 1, 1, 1, 1),
(226, 213, 'tenis', 'nike', '2026-03-12 23:56:10', 44444, 'desgastado', 'par de tenis da nike', NULL, 3, 1, 1, 6, 4, 1),
(227, 214, 'fone', 'teste', '2026-03-13 00:00:53', 76567, 'preservado', 'fone vermelho', NULL, 11, 4, 1, 1, 1, 1),
(228, 215, 'iguii', 'uoihu', '2026-03-13 00:02:10', 87897, 'preservado', 'Fone', NULL, 5, 1, 1, 1, 1, 1),
(230, 216, 'teste', 'teste', '2026-03-13 00:04:55', 555555, 'preservado', 'Fone de ouvido vermelho', NULL, 3, 1, 1, 1, 1, 1),
(231, 217, 'teste', 'teste', '2026-03-13 00:09:12', 777777, 'preservado', 'Fone vermelho', NULL, 3, 1, 1, 1, 1, 1),
(232, 218, 'Alimento Perecível Teste', 'Marca Teste', '2026-03-11 03:00:00', 0, 'preservado', 'Item de teste para filtro Vence Hoje / Vencido', NULL, 1, 5, 1, 15, NULL, 1),
(234, 219, 'Teste VENCE HOJE - Perecível', 'Marca Teste', '2026-03-12 03:00:00', 8031, 'preservado', 'Item criado para testar filtro Vence Hoje', NULL, 1, 5, 1, 15, NULL, 1),
(235, 220, 'teste 6 trilhoes', 'teste 6 trilhoes', '2026-03-14 16:22:06', 8032, 'preservado', 'teste', NULL, 7, 1, 1, 1, 1, 1),
(236, 221, 'item perecivel teste 1', 'item perecivel teste 1', '2026-03-14 16:30:49', 8033, 'preservado', 'item perecivel teste 1', NULL, 12, 5, 1, 15, 6, 1),
(237, 222, 'item perecivel teste 2', 'item perecivel teste 2', '2026-03-14 16:32:41', 8034, 'desgastado', 'item perecivel teste 2', NULL, 6, 5, 1, 15, 6, 1),
(238, 223, 'item perecivel teste 3', 'item perecivel teste 3', '2026-03-14 16:33:40', 8035, 'preservado', 'item perecivel teste 3', NULL, 7, 5, 1, 15, 6, 1),
(239, 224, 'item perecivel teste 4', 'item perecivel teste 4', '2026-03-14 16:34:14', 8036, 'preservado', 'item perecivel teste 4', NULL, 6, 5, 1, 15, 6, 1),
(240, 225, 'item perecivel teste 5', 'item perecivel teste 5', '2026-03-14 16:34:43', 8037, 'preservado', 'item perecivel teste 5', NULL, 8, 5, 1, 15, 6, 1),
(241, 226, 'item generico teste', 'teste', '2026-03-14 22:42:15', 8038, 'preservado', 'item generico teste', NULL, 21, 4, 1, 18, 8, 1),
(243, 227, 'item generico teste', 'teste', '2026-03-14 22:45:19', 8039, 'preservado', 'item generico teste 2', NULL, 21, 5, 1, 15, 8, 1),
(244, 228, 'teste generico', 'teste generico', '2026-03-15 15:04:44', 8040, 'preservado', 'teste generico', NULL, 22, 4, 1, 2, 2, 1),
(245, 229, 'teste eletronico', 'teste', '2026-03-15 15:06:23', 8041, 'desgastado', 'teste eletronico', NULL, 20, 4, 1, 1, NULL, 1),
(246, 230, 'teste vestuario', 'teste vestuario', '2026-03-15 15:07:43', 8042, 'preservado', 'teste vestuario', NULL, 8, 4, 1, 6, 4, 1),
(247, 231, 'Notebook', 'Acer', '2026-03-18 23:21:57', 8043, 'preservado', 'Cor preto e sem defeitos', NULL, 6, 4, 1, 1, 1, 1),
(248, 232, 'Fone de ouvido bluetooth ', 'Thinkplus', '2026-03-19 02:03:52', 8044, 'preservado', 'Fone Bluetooth preto com caixa com apenas 1 fone', NULL, 22, 4, 1, 1, 1, 1),
(249, 233, 'Camiseta', 'Adidas', '2026-03-25 01:20:48', 8045, 'preservado', 'Camiseta adidas preta', 'Kevin Braga', 2, 4, 1, 6, 4, 1),
(250, 234, 'Teste nome entregador', 'Teste', '2026-03-26 02:13:25', 57415, 'preservado', 'Teste', 'Kevin Braga', 2, 1, 1, 1, 1, 1),
(251, 235, 'teste', 'teste', '2026-03-27 14:34:40', 5676, 'preservado', 'teste de pessoa que entregou o item generico', 'teste de pessoa que entregou o item', 13, 1, 1, 2, 2, 1),
(252, 236, 'teste', 'teste', '2026-03-27 14:39:52', 8046, 'preservado', 'teste de pessoa que entregou o item generico', 'teste de pessoa que entregou o item generico', 20, 1, 1, 1, NULL, 1),
(253, 237, 'teste', 'teste', '2026-03-27 14:41:21', 8047, 'preservado', 'teste de pessoa que entregou o item generico', 'teste de pessoa que entregou o item generico', 5, 1, 1, 1, 1, 1),
(254, 238, 'teste', 'teste', '2026-03-27 14:56:45', 8048, 'preservado', 'teste de pessoa que entregou o item vestuario', 'teste de pessoa que entregou o item vestuario', 2, 1, 1, 6, 4, 1),
(255, 239, 'teste', 'teste', '2026-03-27 15:56:16', 8049, 'preservado', 'teste de pessoa que entregou o item generico', 'teste de pessoa que entregou o item generico', 6, 1, 1, 4, 3, 1),
(256, 240, 'teste de pessoa que entregou o item generico', 'teste de pessoa que entregou o item generico', '2026-03-27 15:57:15', 8050, 'preservado', 'teste de pessoa que entregou o item generico', 'teste de pessoa que entregou o item generico', 5, 1, 2, 3, 3, 1),
(257, 241, 'teste', 'teste', '2026-03-27 16:39:24', 8051, 'preservado', 'teste', 'Karen Braga', 2, 1, 1, 1, NULL, 1),
(258, 242, 'Biscoito', 'Club social', '2026-03-27 16:45:31', 8052, 'preservado', 'Ainda lacrado', 'Kevin', 6, 3, 1, 15, 8, 1),
(259, 243, 'teste', 'teste', '2026-03-27 18:23:01', 8053, 'preservado', 'teste novo cadastro', 'Karen Braga teste', 23, 4, 9, 19, 9, 1),
(260, 244, 'Teclado', 'Fortrek', '2026-03-27 19:44:09', 8054, 'preservado', 'Teclado com cabo e com RGB', NULL, 2, 1, 2, 1, 1, 1),
(261, 245, 'Controle', 'LG', '2026-03-27 19:55:19', 8055, 'preservado', 'Controle preto com 2 pilhas', NULL, 5, 1, 9, 1, 1, 1),
(262, 246, 'Mouse', 'Fortrek', '2026-03-27 20:01:36', 5056, 'preservado', 'Teste', NULL, 7, 1, 9, 1, 1, 1),
(263, 247, 'Biscoito', 'Nenhuma', '2026-03-27 20:06:18', 8057, 'preservado', 'Pacote pela metade', 'Claudete Braga', 21, 3, 9, 15, 6, 1),
(264, 248, 'Controle ps4', 'Sony', '2026-03-27 20:27:42', 8058, 'preservado', 'Preto com todos os botoes', NULL, 20, 1, 3, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_vestuario`
--

CREATE TABLE `itens_vestuario` (
  `id` int(11) NOT NULL,
  `cor` varchar(15) NOT NULL,
  `tamanho` enum('PP','P','M','G','GG') NOT NULL,
  `item_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `itens_vestuario`
--

INSERT INTO `itens_vestuario` (`id`, `cor`, `tamanho`, `item_id`) VALUES
(1, 'Branco', 'G', 5),
(2, 'teste', 'M', 117),
(3, 'teste', 'GG', 162),
(4, 'teste', 'G', 168),
(5, 'Preto', 'M', 177),
(6, 'preto', 'G', 226),
(7, 'vermelho', 'G', 246),
(8, 'preta', 'GG', 249),
(9, 'branco', 'P', 254);

-- --------------------------------------------------------

--
-- Estrutura para tabela `locais_shopping`
--

CREATE TABLE `locais_shopping` (
  `id` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `locais_shopping`
--

INSERT INTO `locais_shopping` (`id`, `nome`, `ativo`) VALUES
(1, 'Entrada principal', 1),
(2, 'Entrada lateral', 1),
(3, 'Área de convivência', 1),
(4, 'Quiosques', 1),
(5, 'Elevador', 1),
(6, 'Estacionamento A', 1),
(7, 'Estacionamento B', 1),
(8, 'Praça 1', 1),
(9, 'Praça 2', 1),
(10, 'Cinema', 1),
(11, 'Cinema 2', 1),
(12, 'Elevador 2', 1),
(13, 'Elevador 3', 1),
(14, 'Quiosques 2', 1),
(15, 'Quiosques 3', 1),
(16, 'Estacionamento C', 1),
(17, 'Estacionamento D', 1),
(18, 'Estacionamento E', 1),
(19, 'Estacionamento F', 1),
(20, 'Praça de alimentação Ala Norte', 1),
(21, 'Praça 3', 1),
(22, 'local teste', 1),
(23, 'local novo teste', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `niveis_acesso`
--

CREATE TABLE `niveis_acesso` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `niveis_acesso`
--

INSERT INTO `niveis_acesso` (`id`, `nome`) VALUES
(1, 'Administrador'),
(2, 'Operador');

-- --------------------------------------------------------

--
-- Estrutura para tabela `operadores`
--

CREATE TABLE `operadores` (
  `id` int(11) NOT NULL,
  `nome_completo` varchar(150) NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `data_nascimento` date NOT NULL,
  `ativo` tinyint(4) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `proprietarios`
--

CREATE TABLE `proprietarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `cpf` varchar(20) DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `proprietarios`
--

INSERT INTO `proprietarios` (`id`, `nome`, `telefone`, `cpf`, `rg`, `ativo`) VALUES
(1, 'Kevin', '15988249913', '47738190817', '581708222', 1),
(2, 'teste', '15988215678', '47738940713', '87687687687', 1),
(3, 'teste', '234234234234', '234234234234', '234234234234', 1),
(4, 'teste', '234234234', '234234234', '234234234', 1),
(5, 'Karen', '34242423234', '23423423423', '23423423423', 1),
(6, 'teste foto', '123123123', '2133123213', '2313412312', 1),
(7, 'teste de entrega', '12321312312', '12312312321', '12312312312', 1),
(8, 'teste de entrega sem id real', '123123123', '213123122', '123213123', 1),
(9, 'teste de data devolução', '123123123', '213213212', '213213213', 1),
(10, 'teste de atualização com filtro', '213123123', '123123123', '123123123', 1),
(11, 'teste atualização de pagina', '12123123', '12312313', '23121321', 1),
(12, 'teste entrega Registro adicional de evidencia', '2132132321', '6575676576', '5675675676', 1),
(13, 'teste', '23234234234', '23423423434', '23423434342', 1),
(14, 'Teste entrega mobile', '15988249913', '47738390512', '561768326', 1),
(15, 'Kevin', '157516736559', '464882023781', '37373764747', 1),
(16, 'teste de requisição automatica', '34321423423', '2344243234', '234234234234', 1),
(17, 'teste requisição automatica', '3423423423', '2342342342', '23423423423', 1),
(18, 'Marcos', '234234234', '2234234234234', '234234234234', 1),
(19, 'Novo teste entrega mobile', '5751846618', '484548466484', '363635378383', 1),
(20, 'Teste Requisição Mobile', '15988515678', '4218843848154', '63748484774', 1),
(21, 'Teste devoluçao com foto mobile', '548768104648', '5481358104318', '464737373', 1),
(22, 'teste', '234234234234', '545458187348', '63674474547', 1),
(23, 'Kevin Christian ', '15985215678', '47838948567', '151536634363', 1),
(24, 'Kevin Braga', '15988249913', '47750564016', '63637373636', 1),
(25, 'Kevin', '54518454846', '546484646', '36637373737', 1),
(26, 'Teste', '9999999999', '000000000000', NULL, 1),
(27, 'teste', '888888888', '2222222222', '11111111', 1),
(28, 'Kevin', '4553453345', '4353456456', '5465464564', 1),
(29, 'Kevin Braga', '(15) 98824-9913', '477.381.908-17', '58.170.822-2', 1),
(30, 'teste padrao', '(43) 53534-5345', '435.345.345-34', '43.534.534-5', 1),
(31, 'teste termo com foto', '(45) 53453-4543', '435.435.345-43', '43.534.534-5', 1),
(32, 'teste', '(34) 53453-4543', '345.345.345-34', '43.534.534-5', 1),
(33, 'Karen Braga ', '64876481816', '15124818145', '111184652', 1),
(34, 'Kevin Braga ', '15988249913', '51545184618', '468181646', 1),
(35, 'Kevin Braga', '15986435629', '45451664186', '215143611', 1),
(36, 'Kevin Braga', '(15) 67565-4786', '423.534.564-56', '23.423.364-4', 1),
(37, 'Kevin', '(15) 46576-4874', '345.674.578-65', '34.567.468-5', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `requisicoes_cliente`
--

CREATE TABLE `requisicoes_cliente` (
  `id` int(11) NOT NULL,
  `codigo_requisicao` varchar(8) NOT NULL,
  `nome_cliente` varchar(150) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `categoria_objeto` varchar(100) DEFAULT NULL,
  `descricao` text NOT NULL,
  `responsavel_cadastro` varchar(100) DEFAULT NULL,
  `operador_id` int(11) DEFAULT NULL,
  `assinatura_operador` varchar(150) DEFAULT NULL,
  `data_requisicao` timestamp NOT NULL DEFAULT current_timestamp(),
  `encontrado` tinyint(4) DEFAULT 0,
  `item_id` int(11) DEFAULT NULL,
  `ativo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `requisicoes_cliente`
--

INSERT INTO `requisicoes_cliente` (`id`, `codigo_requisicao`, `nome_cliente`, `telefone`, `categoria_objeto`, `descricao`, `responsavel_cadastro`, `data_requisicao`, `encontrado`, `item_id`, `ativo`) VALUES
(1, '4A9CC61C', 'Kevin', '15988249913', 'Eletronico', 'Celular iPhone X com capa preta', NULL, '2026-02-06 01:04:53', 1, NULL, 1),
(2, '39894486', 'karen', '2134234234', 'celular Iphone 15 pro max', 'o celular esta com capa preta e pelicula intacta', NULL, '2026-02-14 23:12:25', 1, 164, 1),
(3, '1A649D0E', 'Kevin', '15988249913', 'Eletronico', 'Console Nintendo Portatil Switch Lite amarelo perdido no estacionamento', NULL, '2026-02-16 01:47:44', 1, 103, 1),
(4, '24077F24', 'Kevin Braga', '15988249913', 'Eletronico', 'Console Portatil Nintendo perdido no estacionamento', NULL, '2026-02-16 02:07:19', 1, 103, 1),
(5, '1B72AAAF', 'teste', '234234234', 'Eletronico', 'Celular Galaxy A30 capa transparente', NULL, '2026-02-16 13:10:21', 1, 149, 1),
(6, '9E29AA59', 'teste de requisição sem id real', '213213213', 'teste', 'teste', NULL, '2026-02-17 16:01:48', 1, 150, 1),
(7, '5D5E8A50', 'teste requisição sem mudar para devolução', '234234234', 'teste', 'teste', NULL, '2026-02-17 22:54:14', 1, 165, 1),
(8, '41EA3DAC', 'teste', '123123123', 'teste', 'descrição teste', NULL, '2026-02-18 21:27:19', 1, 112, 1),
(9, '71B82C07', 'Kevin Christian de Oliveira Braga ', '15988249913', 'Eletronico', 'Celular Redmi note 10', NULL, '2026-02-25 01:14:41', 0, NULL, 1),
(10, '33D5070E', 'teste', '23424234234', 'Eletrônicos', 'teste', NULL, '2026-02-25 12:46:16', 1, NULL, 1),
(11, 'A039FB2A', 'teste requisição automatica', '23423424234', 'Acessórios', 'teste requisição automatica', NULL, '2026-02-25 13:09:42', 1, 87, 1),
(12, '11D1CFC8', 'Kevin Braga', '13213123213', 'Cartões', 'Cartao Nubank', NULL, '2026-02-26 00:43:53', 1, 191, 1),
(13, 'AE3D5492', 'Karen', '3424234234234', 'Bolsas', 'bolsa de couro', NULL, '2026-02-26 00:44:11', 0, NULL, 1),
(14, '2289C69B', 'Marcos', '324234234234', 'Sacolas de compras', 'carteira de couro marrom com documentos', NULL, '2026-02-26 01:12:30', 1, 2, 1),
(15, 'CEB9FC3B', 'Kevin Braga', '213123123123', 'Cartões', 'Cartao de credito nubank Kevin Braga', NULL, '2026-03-03 01:10:23', 0, NULL, 1),
(16, '9C4F25A4', 'Teste Requisição Mobile', '15988515678', 'Teste', 'Teste Requisição Mobile', NULL, '2026-03-05 00:25:46', 1, 183, 1),
(17, '3213A2C2', 'teste', '324234234234', 'Brinquedos', 'Celular teste de notificação de requisição', NULL, '2026-03-07 15:49:17', 0, NULL, 1),
(18, '1B7ED571', 'teste', '34535345345', 'Eletrônicos', 'Celular teste de notificação de requisição', NULL, '2026-03-07 15:50:06', 0, NULL, 1),
(19, '0CFBBC46', 'teste', '234234234234', 'Documentos', 'par de tenis azul jeans', NULL, '2026-03-07 15:53:23', 1, 212, 1),
(20, 'F08EF124', 'teste', '24234234234', 'Diversos', 'teste de duas fotos', NULL, '2026-03-07 16:31:59', 0, NULL, 1),
(21, '6FC4FA58', 'teste', '234234234234', 'Perecíveis', 'com sinais de deterioração', NULL, '2026-03-07 16:33:00', 0, NULL, 1),
(22, 'D96784A1', 'Kevin Christian ', '15985215678', 'Eletrônico ', 'Controle LG preto com 2 pilhas', NULL, '2026-03-08 16:16:09', 1, 218, 1),
(23, '0EAEFDA6', 'Kevin Braga', '15988249913', 'Eletrônico ', 'Caixa de som fantasma branco marca amethyst', NULL, '2026-03-09 23:58:04', 1, 219, 1),
(24, '362280FD', 'teste', '342342343', 'Vestuário', 'Par de tenis', NULL, '2026-03-12 19:45:07', 0, NULL, 1),
(25, '67DF2BD4', 'Teste', '99999999999', 'Eletrônico ', 'Fone de ouvido vermelho', NULL, '2026-03-12 22:49:44', 1, 227, 1),
(26, '7D94FBB1', 'teste', '999999999', 'Vestuário', 'tenis nike', NULL, '2026-03-13 00:11:03', 0, NULL, 1),
(27, '3D8ED613', 'teste', '7777777777', 'Vestuário', 'par de tenis da nike preto', NULL, '2026-03-13 00:13:00', 0, NULL, 1),
(28, '3D977C41', 'teste', '6666666666', 'Chaves', 'chaveiro com 2 chaves', NULL, '2026-03-13 00:14:23', 0, NULL, 1),
(29, '25FFA6D0', 'teste', '(34) 53453-4534', 'Eletrônicos', 'Celular', NULL, '2026-03-15 15:15:19', 0, NULL, 1),
(30, 'E0D8F8C6', 'Teste de requisição mobile', '548451845', 'Documentos', 'Teste de requisição mobile', NULL, '2026-03-15 17:18:44', 0, NULL, 1),
(31, 'BBBF3BBE', 'Teste de requisição mobile 2', '34815784464', 'Documentos', 'Teste de requisição mobile 2', NULL, '2026-03-15 17:28:15', 0, NULL, 1),
(32, 'A43FF2C8', 'teste requisição', '(45) 43534-5345', 'Eletrônicos', 'teste', NULL, '2026-03-17 00:18:08', 1, 244, 1),
(33, '269DF043', 'Kevin Braga ', '15988249913', 'Eletrônicos', 'Fone Bluetooth preto ainda na caixa com apenas 1 fone', NULL, '2026-03-19 02:05:36', 1, 248, 1),
(34, 'H47C83S8', 'Kevin Braga', '(53) 23567-4745', 'Chaves', 'chaves de carro com chaveiro da chevrolet', NULL, '2026-03-23 01:48:39', 0, NULL, 1),
(35, '2M71EU0C', 'Kevin', '15988431816', 'Vestuário', 'Camiseta preta', NULL, '2026-03-25 00:28:43', 1, 249, 1),
(36, '0YEMT71W', 'Kevin Braga', '(15) 67567-5673', 'Joias', 'teste', 'Administrador Sistema', '2026-03-27 03:01:13', 0, NULL, 1),
(37, 'WVB7TB1Q', 'Kevin Braga', '(15) 92859-4385', 'Documentos', 'Rg', 'Administrador Sistema', '2026-03-27 03:33:24', 0, NULL, 1),
(38, 'S2JX5AA3', 'Kevin Braga', '(15) 38529-8457', 'Eletrônicos', 'teste', 'Kevin Christian de Oliveira Braga ', '2026-03-27 13:11:47', 0, NULL, 1),
(39, '5HXY7RP9', 'teste', '(15) 65463-5465', 'Diversos', 'teste', 'Kevin Braga', '2026-03-27 13:23:17', 0, NULL, 1),
(40, 'GKV9S8TJ', 'teste', '(15) 65436-4574', 'Diversos', 'teste', 'Karen Braga', '2026-03-27 13:34:17', 1, 193, 1),
(41, 'WE9QA91M', 'teste', '(32) 42342-3453', 'categoria teste', 'teste', 'Kevin Christian de Oliveira Braga ', '2026-03-27 18:25:34', 1, 259, 1),
(42, 'XVMZVGZN', 'teste', '(54) 64566-5765', 'Carteiras', 'teste', 'Karen Braga', '2026-03-27 18:40:58', 0, NULL, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `situacao_objeto`
--

CREATE TABLE `situacao_objeto` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `situacao_objeto`
--

INSERT INTO `situacao_objeto` (`id`, `nome`) VALUES
(1, 'No prazo'),
(2, 'Vence hoje'),
(3, 'Vencido'),
(4, 'Devolvido'),
(5, 'Finalizado');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tipos_objeto`
--

CREATE TABLE `tipos_objeto` (
  `id` int(11) NOT NULL,
  `nome` varchar(55) NOT NULL,
  `prazo_dias` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tipos_objeto`
--

INSERT INTO `tipos_objeto` (`id`, `nome`, `prazo_dias`) VALUES
(1, 'Eletrônicos', 90),
(2, 'Documentos', 90),
(3, 'Cartões', 90),
(4, 'Carteiras', 90),
(5, 'Bolsas', 90),
(6, 'Vestuário', 90),
(7, 'Acessórios', 90),
(8, 'Óculos', 90),
(9, 'Chaves', 90),
(10, 'Joias', 90),
(11, 'Itens infantis', 90),
(12, 'Brinquedos', 90),
(13, 'Sacolas de compras', 90),
(14, 'Medicamentos', 90),
(15, 'Perecíveis', 3),
(16, 'Diversos', 90),
(17, 'Dinheiro', 30),
(18, 'Relogio', 90),
(19, 'categoria teste', 90);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `nivel_acesso_id` int(11) NOT NULL,
  `ativo` tinyint(4) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `nivel_acesso_id`, `ativo`, `data_cadastro`) VALUES
(1, 'Administrador Sistema', 'admin@iguatemi.com.br', 'cDtHrW+YsEYOj18Byrnf9g==:7eg95ddhpSdwPinisl9CDXi6nGP3YEMmXLdQpL+tqLM=', 1, 1, '2026-02-06 00:36:17'),
(2, 'Karen Braga', 'karen.braga@iguatemi.com.br', 'senha123', 2, 1, '2026-02-06 00:36:17'),
(3, 'Kevin Braga', 'kevin.braga@iguatemi.com.br', 'senha123', 2, 1, '2026-02-06 00:36:17'),
(9, 'Kevin Christian de Oliveira Braga ', 'kevin.c.o.braga@gmail.com', '$2b$10$yYnacfn8kJh0MU7KnhBwy.WgibKScut9PKEoSQOCGjlflKfZp2uX2', 1, 1, '2026-03-07 21:44:48'),
(10, 'Kevin Braga', 'kevin@gmail.com', '+RtXqa/2xGnmGT+k+fAVVg==:l1rPysTZBjCTMO6TKgccDezU5vppQyZ73qkeZwbKmDk=', 2, 1, '2026-03-15 00:08:56'),
(11, 'Kevin Braga', 'kevinbraga@gmail.com', '$2b$10$XknW7IlOaOKuLYk6BY97lOpChUKE1jzA4HRtoxwlonLWbp6e6Oyie', 2, 1, '2026-03-15 00:37:06');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `caixas_armazenamento`
--
ALTER TABLE `caixas_armazenamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`);

--
-- Índices de tabela `destinos_finais`
--
ALTER TABLE `destinos_finais`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `entregas`
--
ALTER TABLE `entregas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_autenticacao` (`codigo_autenticacao`),
  ADD KEY `proprietario_id` (`proprietario_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `imagens`
--
ALTER TABLE `imagens`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `imagens_entrega`
--
ALTER TABLE `imagens_entrega`
  ADD PRIMARY KEY (`id`),
  ADD KEY `imagem_id` (`imagem_id`),
  ADD KEY `entrega_id` (`entrega_id`);

--
-- Índices de tabela `imagens_item`
--
ALTER TABLE `imagens_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `imagem_id` (`imagem_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Índices de tabela `itens_destinados`
--
ALTER TABLE `itens_destinados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `destino_id` (`destino_id`);

--
-- Índices de tabela `itens_eletronicos`
--
ALTER TABLE `itens_eletronicos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Índices de tabela `itens_perdidos`
--
ALTER TABLE `itens_perdidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_registro` (`numero_registro`),
  ADD UNIQUE KEY `numero_lacre` (`numero_lacre`),
  ADD KEY `local_id` (`local_id`),
  ADD KEY `situacao_id` (`situacao_id`),
  ADD KEY `usuario_responsavel_id` (`usuario_responsavel_id`),
  ADD KEY `operador_id` (`operador_id`),
  ADD KEY `tipo_id` (`tipo_id`),
  ADD KEY `caixa_id` (`caixa_id`);

--
-- Índices de tabela `itens_vestuario`
--
ALTER TABLE `itens_vestuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Índices de tabela `locais_shopping`
--
ALTER TABLE `locais_shopping`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `niveis_acesso`
--
ALTER TABLE `niveis_acesso`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `operadores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`);

--
-- Índices de tabela `proprietarios`
--
ALTER TABLE `proprietarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `requisicoes_cliente`
--
ALTER TABLE `requisicoes_cliente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_requisicao` (`codigo_requisicao`),
  ADD KEY `operador_id` (`operador_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Índices de tabela `situacao_objeto`
--
ALTER TABLE `situacao_objeto`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tipos_objeto`
--
ALTER TABLE `tipos_objeto`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `nivel_acesso_id` (`nivel_acesso_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `caixas_armazenamento`
--
ALTER TABLE `caixas_armazenamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `destinos_finais`
--
ALTER TABLE `destinos_finais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `entregas`
--
ALTER TABLE `entregas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de tabela `imagens`
--
ALTER TABLE `imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT de tabela `imagens_entrega`
--
ALTER TABLE `imagens_entrega`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de tabela `imagens_item`
--
ALTER TABLE `imagens_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de tabela `itens_destinados`
--
ALTER TABLE `itens_destinados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de tabela `itens_eletronicos`
--
ALTER TABLE `itens_eletronicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de tabela `itens_perdidos`
--
ALTER TABLE `itens_perdidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=265;

--
-- AUTO_INCREMENT de tabela `itens_vestuario`
--
ALTER TABLE `itens_vestuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `locais_shopping`
--
ALTER TABLE `locais_shopping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `niveis_acesso`
--
ALTER TABLE `niveis_acesso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `operadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `proprietarios`
--
ALTER TABLE `proprietarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de tabela `requisicoes_cliente`
--
ALTER TABLE `requisicoes_cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de tabela `situacao_objeto`
--
ALTER TABLE `situacao_objeto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `tipos_objeto`
--
ALTER TABLE `tipos_objeto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `entregas`
--
ALTER TABLE `entregas`
  ADD CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`proprietario_id`) REFERENCES `proprietarios` (`id`),
  ADD CONSTRAINT `entregas_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `itens_perdidos` (`id`),
  ADD CONSTRAINT `entregas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `imagens_entrega`
--
ALTER TABLE `imagens_entrega`
  ADD CONSTRAINT `imagens_entrega_ibfk_1` FOREIGN KEY (`imagem_id`) REFERENCES `imagens` (`id`),
  ADD CONSTRAINT `imagens_entrega_ibfk_2` FOREIGN KEY (`entrega_id`) REFERENCES `entregas` (`id`);

--
-- Restrições para tabelas `imagens_item`
--
ALTER TABLE `imagens_item`
  ADD CONSTRAINT `imagens_item_ibfk_1` FOREIGN KEY (`imagem_id`) REFERENCES `imagens` (`id`),
  ADD CONSTRAINT `imagens_item_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `itens_perdidos` (`id`);

--
-- Restrições para tabelas `itens_destinados`
--
ALTER TABLE `itens_destinados`
  ADD CONSTRAINT `itens_destinados_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `itens_perdidos` (`id`),
  ADD CONSTRAINT `itens_destinados_ibfk_2` FOREIGN KEY (`destino_id`) REFERENCES `destinos_finais` (`id`);

--
-- Restrições para tabelas `itens_eletronicos`
--
ALTER TABLE `itens_eletronicos`
  ADD CONSTRAINT `itens_eletronicos_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `itens_perdidos` (`id`);

--
-- Restrições para tabelas `itens_perdidos`
--
ALTER TABLE `itens_perdidos`
  ADD CONSTRAINT `itens_perdidos_ibfk_1` FOREIGN KEY (`local_id`) REFERENCES `locais_shopping` (`id`),
  ADD CONSTRAINT `itens_perdidos_ibfk_2` FOREIGN KEY (`situacao_id`) REFERENCES `situacao_objeto` (`id`),
  ADD CONSTRAINT `itens_perdidos_ibfk_3` FOREIGN KEY (`usuario_responsavel_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `itens_perdidos_ibfk_4` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_objeto` (`id`),
  ADD CONSTRAINT `itens_perdidos_ibfk_5` FOREIGN KEY (`caixa_id`) REFERENCES `caixas_armazenamento` (`id`),
  ADD CONSTRAINT `itens_perdidos_ibfk_6` FOREIGN KEY (`operador_id`) REFERENCES `operadores` (`id`);

--
-- Restrições para tabelas `itens_vestuario`
--
ALTER TABLE `itens_vestuario`
  ADD CONSTRAINT `itens_vestuario_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `itens_perdidos` (`id`);

--
-- Restrições para tabelas `requisicoes_cliente`
--
ALTER TABLE `requisicoes_cliente`
  ADD CONSTRAINT `requisicoes_cliente_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `itens_perdidos` (`id`),
  ADD CONSTRAINT `requisicoes_cliente_ibfk_2` FOREIGN KEY (`operador_id`) REFERENCES `operadores` (`id`);

--
-- Restrições para tabelas `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`nivel_acesso_id`) REFERENCES `niveis_acesso` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
