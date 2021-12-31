import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { CoinList } from "./config/api";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";

const Crypto = createContext();

const CryptoContext = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (user) {
      const coinRef = doc(db, "watchlist", user?.uid); // if user is loggedin --> it will take reference to the user
      var unsubscribe = onSnapshot(coinRef, (coin) => {
        if (coin.exists()) {
          console.log(coin.data().coins);
          setWatchlist(coin.data().coins); // if coin exists, sets the watchlist
        } else {
          console.log("No Items in Watchlist");
        }
      });

      return () => {
        // after component is unmounted
        unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  const fetchCoins = async () => {
    setLoading(true); // before fetching, loading is true
    const { data } = await axios.get(CoinList(currency)); // destructuring data from inside of context API
    console.log(data); // after fetching, it's false

    setCoins(data);
    setLoading(false);
  };

  useEffect(() => {
    // whenever currency changes, it runs
    if (currency === "INR") setSymbol("₹");
    else if (currency === "USD") setSymbol("$");
  }, [currency]);

  return (
    <Crypto.Provider
      value={{
        currency,
        setCurrency,
        symbol,
        coins,
        loading,
        fetchCoins,
        alert,
        setAlert,
        user,
        watchlist,
      }}
    >
      {children}
    </Crypto.Provider>
  );
};

export default CryptoContext;

export const CryptoState = () => {
  // importing useContext hook
  return useContext(Crypto);
};
