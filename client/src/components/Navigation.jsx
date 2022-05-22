import React from "react";
import { AppBar, Box, IconButton, Link, Toolbar } from "@mui/material";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { anchors } from "../utils/arrays";
import logo from "../Logo/2011_Logo_white.png";
import "../Logo/logo.css";
import AuthNav from "./Authentication/auth-nav";
export default function Navigation() {
  return (
    <AppBar position="static" elevation={3}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            textAlignVertical: "center",
          }}
        >
          <Link
            href="/"
            variant="h6"
            sx={{
              color: "#fff",
              letterSpacing: "2px",
              textDecoration: "none",
              textAlignVertical: "center",
              marginTop: "20px",
            }}
            className="T-style"
          >
            WonderTix CRM
          </Link>

          <Link href="https://portlandplayhouse.org/" sx={{ ml: 5 }}>
            <img src={logo} className="logo_size"></img>
          </Link>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            textAlignVertical: "center",
          }}
        >
          {anchors.map((anchor) => (
            <Link
              href={anchor.link}
              key={anchor.title}
              underline="none"
              sx={{ color: "#fff", ml: 2 }}
            >
              {anchor.title}
            </Link>
          ))}
          <AuthNav />
          {/* <IconButton
            aria-label="menu"
            edge="start"
            size="large"
            sx={{ ml: 4 }}
          >
            <AccountCircleIcon sx={{ color: "#fff" }} />
          </IconButton> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
