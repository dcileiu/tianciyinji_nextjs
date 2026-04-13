import {
  mysqlTable,
  int,
  varchar,
  text,
  tinyint,
  datetime,
  json,
  date,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  avatar: varchar("avatar", { length: 255 }),
  isActive: tinyint("isActive").notNull().default(1),
  lastLoginAt: datetime("lastLoginAt"),
  token: varchar("token", { length: 255 }),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  updatedAt: datetime("updatedAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const articles = mysqlTable("articles", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  updatedAt: datetime("updatedAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  views: int("views").notNull().default(0),
  order: int("order").notNull().default(0),
  category: varchar("category", { length: 255 }).notNull(),
  tags: text("tags").notNull(),
  isPublished: tinyint("isPublished").notNull().default(1),
  coverImage: varchar("coverImage", { length: 255 })
    .notNull()
    .default("http://p1.qhimg.com/t01b4d0943444706854.jpg"),
});

export const categories = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  order: int("order").notNull().default(0),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  updatedAt: datetime("updatedAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const tags = mysqlTable("tags", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  order: int("order").notNull().default(0),
  isVisible: tinyint("isVisible").notNull().default(1),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  updatedAt: datetime("updatedAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const banners = mysqlTable("banners", {
  id: int("id").primaryKey().autoincrement(),
  imageUrl: varchar("imageUrl", { length: 255 }).notNull(),
  isVisible: tinyint("isVisible").notNull().default(1),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }),
  description: varchar("description", { length: 255 }),
  link: varchar("link", { length: 255 }),
  startTime: datetime("startTime"),
  endTime: datetime("endTime"),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  updatedAt: datetime("updatedAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const advertisements = mysqlTable("advertisements", {
  id: int("id").primaryKey().autoincrement(),
  imageUrl: varchar("imageUrl", { length: 255 }).notNull(),
  isVisible: tinyint("isVisible").notNull().default(1),
  order: int("order").notNull(),
  title: varchar("title", { length: 255 }),
  description: varchar("description", { length: 255 }),
  link: varchar("link", { length: 255 }),
  position: varchar("position", { length: 255 }).notNull(),
  startTime: datetime("startTime"),
  endTime: datetime("endTime"),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  updatedAt: datetime("updatedAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const logs = mysqlTable("logs", {
  id: int("id").primaryKey().autoincrement(),
  level: varchar("level", { length: 255 }).notNull(),
  message: varchar("message", { length: 255 }).notNull(),
  meta: json("meta"),
  userId: int("userId"),
  ip: varchar("ip", { length: 255 }),
  userAgent: varchar("userAgent", { length: 255 }),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const statistics = mysqlTable("statistics", {
  id: int("id").primaryKey().autoincrement(),
  totalViews: int("totalViews").notNull().default(0),
  dailyViews: int("dailyViews").notNull().default(0),
  date: date("date").notNull(),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isCompleted: tinyint("isCompleted").notNull().default(0),
  dueDate: datetime("dueDate"),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
  updatedAt: datetime("updatedAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

export const visits = mysqlTable("visits", {
  id: int("id").primaryKey().autoincrement(),
  ip: varchar("ip", { length: 255 }),
  userAgent: varchar("userAgent", { length: 255 }),
  referer: varchar("referer", { length: 255 }),
  path: varchar("path", { length: 255 }),
  createdAt: datetime("createdAt", { fsp: 6 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(6)`),
});

