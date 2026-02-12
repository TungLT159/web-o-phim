import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import Detail from "../pages/detail/Detail";

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/:category/search/:keyword" component={Catalog} />
      <Route path="/movie/:id" component={Detail} />
      <Route path="/:category/:type" component={Catalog} />

      {/* ✅ fallback route */}
      {/* <Route path="*">
        <Redirect to="/" />
      </Route> */}
    </Switch>
  );
}
