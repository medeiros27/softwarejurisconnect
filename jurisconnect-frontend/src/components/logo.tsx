import React from "react";
import { Box } from "@mui/material";
import logo from "../assets/Logo versao 1.png";

export default function Logo({ size = 80 }: { size?: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={logo}
        alt="JurisConnect"
        width={size}
        height={size}
        style={{ objectFit: "contain", borderRadius: 8 }}
        draggable={false}
      />
    </Box>
  );
}