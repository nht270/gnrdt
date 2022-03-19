
CREATE DATABASE IF NOT EXISTS `testDB`;

USE `testDB`;

CREATE TABLE IF NOT EXISTS `sinhvien` (
  `mssv` varchar(3),
  `ten` varchar(30),
  `lop` float,
  PRIMARY KEY (`mssv`)
);

INSERT INTO `sinhvien`(`mssv`, `ten`, `lop`) VALUES
('ABC','Hồ Nguyễn Hạ Trinh','5UVM'),
('ABD','Bồ Thục Thùy Tâm','20RF'),
('ABE','Kim Minh Bắc','MPIF'),
('ABF','Uông Duy Bắc','20RF'),
('ABG','Từ Vũ Công','MPIF'),
('ABH','Quảng Mạnh Cường','5UVM'),
('ABI','Tri Phương Nhã Phương','5UVM'),
('ABJ','Sùng Thục Bảo Liên','20RF'),
('ABK','Đèo Thành Đạt','MPIF'),
('ABL','Vòng Khả Diệu Châu','5UVM'),
('ABM','Tiết Lý Bích Nhi','20RF'),
('ABN','Mè Thế Biên','MPIF'),
('ABO','Đống Nguyễn Tuệ Quỳnh','20RF'),
('ABP','Trưng Nguyễn Đông Mẫn','MPIF'),
('ABQ','Kông Nguyễn Tuyết Trinh','5UVM'),
('ABR','Chiêu Xuân Cát','5UVM'),
('ABS','Bế Nguyễn Mẫn Ngân','MPIF'),
('ABT','Lưu Hồng Thanh','20RF'),
('ABU','Thế Diễm Lan Hạ','20RF'),
('ABV','Đậu Nguyễn Tuệ Ngọc','5UVM'),
('ABW','Trác Cát Nhã Dung','MPIF'),
('ABX','Vì Trúc Quế Tâm','MPIF'),
('ABY','Ngạc Duy Bách','20RF'),
('ABZ','Thang Đại Công','5UVM'),
('ACA','Ngân Nguyễn Yên Quỳnh','5UVM'),
('ACB','Ngôn Nguyễn Bạch Anh','20RF'),
('ACC','Vang Thế Anh','MPIF'),
('ACD','Mùa Diệp Thảo Châu','5UVM'),
('ACE','Mạch Tường Lan Thảo','MPIF'),
('ACF','Phạm Bảo An Diệp','20RF');


CREATE TABLE IF NOT EXISTS `lop` (
  `malop` float,
  `ten lop` varchar(4),
  PRIMARY KEY (`malop`)
);

INSERT INTO `lop`(`malop`, `ten lop`) VALUES
(1,'MPIF'),
(2,'20RF'),
(3,'5UVM');

