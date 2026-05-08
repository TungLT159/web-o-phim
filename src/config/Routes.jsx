import React, { lazy, Suspense } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

// Lazy load page components
const Home = lazy(() => import("../pages/Home"));
const Catalog = lazy(() => import("../pages/Catalog"));
const Detail = lazy(() => import("../pages/detail/Detail"));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.5rem',
    color: '#fff'
  }}>
    <div>Đang tải...</div>
  </div>
);

export default function Routes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}
