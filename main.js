const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");

const express = require("express");
//const morgan = require("morgan"); //추가적인 로그 볼수있게
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const bodyParser = require("body-parser"); //post에서 body 받기
const adminControl = require("./controllers/adminController");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser(process.env.COOKIE_SECRET_KEY));

app.use((req, res, next) => {
  try {
    const decoded = jwt.verify(
      req.cookies.authToken,
      process.env.JWT_SECRET_KEY
    );
    res.locals.auth = decoded.userId;
    res.locals.userType = req.cookies.userType;
    res.locals.is_admin = adminControl.getAdmin(decoded.userId);
  } catch (error) {
    res.locals.auth = "";
    res.locals.userType = "";
    res.locals.is_admin = "";
  }
  next();
});

//Routers
const indexRouter = require("./routers/index"),
  residentRouter = require("./routers/residentRouter"),
  agentRouter = require("./routers/agentRouter.js"),
  reviewRouter = require("./routers/reviewRouter.js"),
  authRouter = require("./routers/authRouter.js"),
  searchRouter = require("./routers/searchRouter"),
  realtorRouter = require("./routers/realtorRouter"),
  adminRouter = require("./routers/adminRouter");

//View
const layouts = require("express-ejs-layouts");
app.set("view engine", "ejs");
app.use(layouts);

app.set("port", process.env.PORT || 3000);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/resident", residentRouter);

//검색페이지 접근
app.use("/search", searchRouter);

//공인중개사 페이지 접근
app.use("/agent", agentRouter);

//후기 접근
app.use("/review", reviewRouter);

//입주민이 보는 공인중개사 페이지 접근
app.use("/realtor", realtorRouter);

// Auth
app.use("/auth", authRouter);

// 관리자
app.use("/admin", adminRouter);

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에게 대기중");
});
