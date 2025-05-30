import { Feather } from "@expo/vector-icons";
import React from "react";

export const icon = {
    home: (props: any) => <Feather name="home" size={24} {...props} />,
    analysis: (props: any) => <Feather name="bar-chart-2" size={24} {...props} />,
    debt: (props: any) => <Feather name="repeat" size={24}  {...props}/>,
    add_transaction: (props: any) => <Feather name="layers" size={24}  {...props}/>,
    profile: (props: any) => <Feather name="user" size={24} {...props}/>
  }