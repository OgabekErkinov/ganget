import { useState, useEffect } from "react";
import axios from "axios";
import { FavoriteBorderOutlined, Favorite, Add, Remove } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import AOS from "aos";
import "aos/dist/aos.css";
import { Product } from "@/interface/interfaces";
import useStore from "@/store/store";

interface CardProps {
  product: Product;
  idx: number;
}

const Card: React.FC<CardProps> = ({ product, idx }) => {
  const { setCarts, setFavourites } = useStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const BASE_URL = "https://json-server-oa7o.onrender.com";

  useEffect(() => {
    AOS.init();
    const fetchData = async () => {
      try {
        const [favRes, cartRes] = await Promise.all([
          axios.get(`${BASE_URL}/favourites`),
          axios.get(`${BASE_URL}/carts`),
        ]);

        setIsFavorite(favRes.data.some((fav: Product) => fav.id === product.id));

        const existingItem = cartRes.data.find(
          (cartItem: { id: number }) => cartItem.id === product.id
        );
        setCartCount(existingItem ? existingItem.quantity : 0);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [product.id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete(`${BASE_URL}/favourites/${product.id}`);
      } else {
        await axios.post(`${BASE_URL}/favourites`, product);
      }

      const updatedFavourites = await axios.get(`${BASE_URL}/favourites`).then(res => res.data);
      setFavourites(updatedFavourites);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error(" Error updating favorites", error);
      alert("Error occurred! Check console.");
    }
  };

  const handleCartChange = async (quantity: number) => {
    if (quantity < 0) return;
    try {
      const response = await axios.get(`${BASE_URL}/carts`);
      const cartItem = response.data.find((item: { id: number }) => item.id === product.id);

      const cartData = { ...product, quantity };

      if (quantity === 0) {
        await axios.delete(`${BASE_URL}/carts/${product.id}`);
      } else if (cartItem) {
        await axios.put(`${BASE_URL}/carts/${product.id}`, cartData);
      } else {
        await axios.post(`${BASE_URL}/carts`, cartData);
      }

      const updatedCarts = await axios.get(`${BASE_URL}/carts`).then(res => res.data);
      setCarts(updatedCarts);
      setCartCount(quantity);
    } catch (error) {
      console.error("❌ Error updating cart", error);
      alert("Error updating cart!");
    }
  };

  return (
    <Box display="flex" flexDirection="column" position="relative" borderRadius="8px" overflow="hidden"
         border="1px solid gray" height="340px" maxWidth="250px" width="100%" mx="auto" bgcolor="#F2F2F2"
         data-aos="fade-up" data-aos-delay={50 * idx}
         sx={{ transition: "0.3s ease", "&:hover": { transform: "scale(1.05)" } }}>
      <IconButton onClick={toggleFavorite} sx={{ position: "absolute", top: 10, right: 10 }}>
        {isFavorite ? <Favorite sx={{ color: "red" }} /> : <FavoriteBorderOutlined />}
      </IconButton>

      {product?.image && (
        <Box component="img" src={product?.image} height="50%" width="80%"
             mx="auto" mt={1}  sx={{ objectFit: "contain", bgcolor: "#F2F2F2" }} /> )}

       <Stack height="50%" p={2} justifyContent="space-between" bgcolor="#fff">
        <Box>
          <Typography variant="h6">{product?.category}</Typography>
          <Typography fontSize="16px">{product?.name}</Typography>
        </Box>
        <Box>
          <Typography sx={{ color: "gray", textDecoration: "line-through" }}>{product?.price}$</Typography>
          <Typography fontWeight="bold" color="#002E58" fontSize="24px">{product?.inDiscount}$</Typography>
        </Box>
       </Stack>

       <Stack direction="row" alignItems="center" justifyContent="center"
              sx={{ position: "absolute", bottom: 10, right: 10 }}>
        <IconButton onClick={() => handleCartChange(cartCount - 1)} disabled={cartCount === 0}>
          <Remove />
        </IconButton>
        <Typography>{cartCount}</Typography>
        <IconButton onClick={() => handleCartChange(cartCount + 1)}>
          <Add />
        </IconButton>
       </Stack>
    </Box>
  );
};

export default Card;
