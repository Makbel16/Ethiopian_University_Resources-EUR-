import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/esm/DashboardRounded.js";
import FolderOpenRoundedIcon from "@mui/icons-material/esm/FolderOpenRounded.js";
import PersonRoundedIcon from "@mui/icons-material/esm/PersonRounded.js";
import ArticleRoundedIcon from "@mui/icons-material/esm/ArticleRounded.js";
import EmailRoundedIcon from "@mui/icons-material/esm/EmailRounded.js";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/esm/AdminPanelSettingsRounded.js";
import LogoutRoundedIcon from "@mui/icons-material/esm/LogoutRounded.js";
import MenuRoundedIcon from "@mui/icons-material/esm/MenuRounded.js";
import TrendingUpRoundedIcon from "@mui/icons-material/esm/TrendingUpRounded.js";
import NewReleasesRoundedIcon from "@mui/icons-material/esm/NewReleasesRounded.js";
import BookmarkRoundedIcon from "@mui/icons-material/esm/BookmarkRounded.js";
import CloudUploadRoundedIcon from "@mui/icons-material/esm/CloudUploadRounded.js";
import EditRoundedIcon from "@mui/icons-material/esm/EditRounded.js";
import DeleteOutlineRoundedIcon from "@mui/icons-material/esm/DeleteOutlineRounded.js";
import DownloadRoundedIcon from "@mui/icons-material/esm/DownloadRounded.js";
import SchoolRoundedIcon from "@mui/icons-material/esm/SchoolRounded.js";
import { useAuth } from "./state.jsx";

const categories = ["Lecture Notes", "Previous Exams", "Textbooks/PPTs", "Research Papers", "Lab Manuals", "Reference Links"];
const universities = ["Addis Ababa University", "Bahir Dar University", "Jimma University", "Mekelle University", "ASTU", "Other Ethiopian Universities"];
const yearSemesterOptions = [
  "Year 1 - Semester 1",
  "Year 1 - Semester 2",
  "Year 2 - Semester 1",
  "Year 2 - Semester 2",
  "Year 3 - Semester 1",
  "Year 3 - Semester 2",
  "Year 4 - Semester 1",
  "Year 4 - Semester 2",
  "Year 5 - Semester 1",
  "Year 5 - Semester 2"
];

const drawerWidth = 272;

const theme = createTheme({
  palette: {
    primary: { main: "#1158c7" },
    secondary: { main: "#00a085" },
    background: { default: "#eef2f8", paper: "#ffffff" }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: "0 4px 24px rgba(17, 88, 199, 0.08)" } } }
  }
});

const Protected = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const AdminProtected = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const navIsActive = (pathname, path) => {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
};

const PublicLayout = ({ children }) => {
  const { token, user, logout } = useAuth();
  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar sx={{ gap: 1, flexWrap: "wrap", py: 1 }}>
          <SchoolRoundedIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>
            Ethiopia University Resource Hub
          </Typography>
          {!token && (
            <>
              <Button component={Link} to="/">Welcome</Button>
              <Button component={Link} to="/login">Login</Button>
              <Button variant="contained" component={Link} to="/register">Create Account</Button>
            </>
          )}
          {token && (
            <>
              <Button component={Link} to="/">Dashboard</Button>
              <Button component={Link} to="/resources">Resources</Button>
              <Button component={Link} to="/profile">Profile</Button>
              <Button component={Link} to="/blog">Study Tips</Button>
              <Button component={Link} to="/contact">Contact</Button>
              {user?.role === "admin" && <Button component={Link} to="/admin">Admin</Button>}
              <Button startIcon={<LogoutRoundedIcon />} onClick={logout}>Logout</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>{children}</Container>
    </>
  );
};

const AppShell = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = [
    { to: "/", label: "Dashboard", icon: <DashboardRoundedIcon /> },
    { to: "/resources", label: "Browse Resources", icon: <FolderOpenRoundedIcon /> },
    { to: "/profile", label: "My Profile", icon: <PersonRoundedIcon /> },
    { to: "/blog", label: "Study Tips", icon: <ArticleRoundedIcon /> },
    { to: "/contact", label: "Contact", icon: <EmailRoundedIcon /> }
  ];
  if (user?.role === "admin") {
    items.push({ to: "/admin", label: "Admin Console", icon: <AdminPanelSettingsRoundedIcon /> });
  }

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar sx={{ px: 2, gap: 1.5, alignItems: "center" }}>
        <SchoolRoundedIcon color="primary" sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ lineHeight: 1.2 }}>Resource Hub</Typography>
          <Typography variant="body2" fontWeight={800}>Ethiopia</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 2, py: 2, bgcolor: "action.hover", mx: 1.5, mt: 1, borderRadius: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>{user?.fullName?.charAt(0) || "?"}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>{user?.fullName}</Typography>
            <Chip size="small" label={user?.role === "admin" ? "Administrator" : "Student"} color={user?.role === "admin" ? "secondary" : "default"} sx={{ mt: 0.5, height: 22 }} />
          </Box>
        </Stack>
      </Box>
      <List sx={{ px: 1, py: 2, flex: 1 }}>
        {items.map((item) => (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.to}
              selected={navIsActive(location.pathname, item.to)}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 2, "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "& .MuiListItemIcon-root": { color: "inherit" } } }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: "0.95rem" }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" color="inherit" startIcon={<LogoutRoundedIcon />} onClick={logout} sx={{ borderRadius: 2 }}>
          Sign out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider"
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: "none" } }}>
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 800 }}>
            {title || "Dashboard"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, borderRight: 1, borderColor: "divider" } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, minHeight: "100vh" }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 } }}>{children}</Container>
      </Box>
    </Box>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
  <Card sx={{ height: "100%", background: "linear-gradient(145deg, #fff 0%, #f4f8ff 100%)" }}>
    <CardContent>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>{value}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
        <Box sx={{ color: "primary.main", opacity: 0.9 }}>{icon}</Box>
      </Stack>
    </CardContent>
  </Card>
);

const Welcome = () => (
  <PublicLayout>
    <Paper sx={{ p: { xs: 3, md: 7 }, mb: 4, overflow: "hidden", position: "relative", background: "linear-gradient(125deg, #dbeafe 0%, #ecfdf5 45%, #fff 100%)" }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={7}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.15 }}>
            Learn smarter. Share stronger.
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 3, fontWeight: 500 }}>
            Ethiopia&apos;s university hub for lecture notes, past exams, lab manuals, and study strategies — built for students, curated by admins.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button variant="contained" size="large" component={Link} to="/register" sx={{ px: 4, py: 1.5 }}>
              Create free account
            </Button>
            <Button variant="outlined" size="large" component={Link} to="/login" sx={{ px: 4, py: 1.5 }}>
              Sign in
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, bgcolor: "rgba(255,255,255,0.85)" }}>
            <Stack spacing={2}>
              <Typography fontWeight={700}>Why students use this hub</Typography>
              {["Filtered by university & year", "Track downloads & bookmarks", "Weekly trending materials", "Exam-focused study tips"].map((t) => (
                <Stack key={t} direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label="✓" color="secondary" sx={{ minWidth: 32 }} />
                  <Typography variant="body2">{t}</Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Paper>
    <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 2 }}>FEATURES</Typography>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {[
        ["Dashboard insights", "Recent uploads, top downloads, and recommendations tuned to your profile."],
        ["Deep filters", "Category, university, year/semester, and subject — find exactly what you need."],
        ["Professional admin tools", "Secure uploads, resource library management, and study-tip publishing."],
        ["Built for every screen", "Responsive layout from phone to desktop."]
      ].map(([title, desc]) => (
        <Grid item xs={12} sm={6} lg={3} key={title}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 800 }}>{title}</Typography>
              <Typography variant="body2" color="text.secondary">{desc}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </PublicLayout>
);

const AuthPage = ({ type }) => {
  const isRegister = type === "register";
  const { api, login } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    universityName: "Addis Ababa University",
    studentId: "",
    password: "",
    yearSemester: "Year 1 - Semester 1"
  });
  const submit = async () => {
    try {
      setBusy(true);
      setError("");
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const res = await api.post(endpoint, form);
      login(res.data);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Request failed. Please check your inputs.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PublicLayout>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={7} lg={5}>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{isRegister ? "Create your account" : "Welcome back"}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{isRegister ? "Join thousands of students discovering quality materials." : "Sign in to access your dashboard and saved resources."}</Typography>
              </Box>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email" type="email" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {isRegister && <TextField label="Full name" fullWidth value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />}
              {isRegister && <TextField label="Student ID" fullWidth value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />}
              {isRegister && (
                <TextField select fullWidth label="University" value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })}>
                  {universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </TextField>
              )}
              {isRegister && (
                <TextField select fullWidth label="Year / Semester" value={form.yearSemester} onChange={(e) => setForm({ ...form, yearSemester: e.target.value })}>
                  {yearSemesterOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
              )}
              <TextField type="password" label="Password" fullWidth value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {busy && <LinearProgress />}
              <Button disabled={busy} variant="contained" size="large" onClick={submit}>{isRegister ? "Create account" : "Sign in"}</Button>
              <Button component={Link} to={isRegister ? "/login" : "/register"}>{isRegister ? "Already have an account? Sign in" : "New here? Create an account"}</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </PublicLayout>
  );
};

const ResourceCard = ({ item }) => {
  const desc = (item.description || "").slice(0, 140);
  const thumb = item.thumbnailUrl;
  return (
    <Card sx={{ height: "100%", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: 6 } }}>
      <CardActionArea component={Link} to={`/resources/${item._id}`}>
        {thumb ? (
          <CardMedia component="img" height="140" image={thumb} alt="" sx={{ objectFit: "cover", bgcolor: "grey.100" }} />
        ) : (
          <Box sx={{ height: 140, bgcolor: "primary.light", opacity: 0.15, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderOpenRoundedIcon sx={{ fontSize: 48, color: "primary.main", opacity: 0.5 }} />
          </Box>
        )}
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.3 }}>{item.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>{desc}{item.description?.length > 140 ? "…" : ""}</Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
            <Chip label={item.category} size="small" variant="outlined" />
            <Chip label={item.subject} size="small" />
            <Chip icon={<TrendingUpRoundedIcon sx={{ fontSize: "16px !important" }} />} label={item.downloadCount ?? 0} size="small" color="default" />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 2 }}>
    <Box>
      <Typography variant="h5">{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </Box>
    {action}
  </Stack>
);

const Dashboard = () => {
  const { api, user } = useAuth();
  const [data, setData] = useState({ recent: [], popular: [], weeklyPopular: [], recommendations: [] });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/dashboard"), api.get("/activity")])
      .then(([d, a]) => {
        setData(d.data);
        setActivity(a.data || []);
      })
      .finally(() => setLoading(false));
  }, [api]);

  const stats = useMemo(() => {
    const totalDl = (data.popular || []).reduce((s, r) => s + (r.downloadCount || 0), 0);
    return {
      recentCount: data.recent?.length || 0,
      topDl: data.popular?.[0]?.downloadCount ?? 0,
      weeklyHits: (data.weeklyPopular || []).slice(0, 3).reduce((s, r) => s + (r.weeklyDownloadCount || 0), 0),
      recCount: data.recommendations?.length || 0
    };
  }, [data]);

  const section = (title, subtitle, items) => (
    <Box sx={{ mb: 4 }}>
      <SectionHeader title={title} subtitle={subtitle} action={<Button component={Link} to="/resources" size="small" variant="outlined">View all</Button>} />
      <Grid container spacing={2}>{(items || []).map((x) => <Grid item xs={12} sm={6} md={4} key={x._id}><ResourceCard item={x} /></Grid>)}</Grid>
    </Box>
  );

  return (
    <AppShell title="Dashboard">
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, background: "linear-gradient(110deg, #e8f0ff 0%, #f0fdf9 100%)" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
          <Box>
            <Typography variant="overline" color="primary" fontWeight={700}>Hello</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>{user?.fullName || "Student"}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Here&apos;s what&apos;s new for you today — fresh uploads, trending files, and picks matched to your profile.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" component={Link} to="/resources" startIcon={<FolderOpenRoundedIcon />}>Browse library</Button>
            <Button variant="outlined" component={Link} to="/profile" startIcon={<BookmarkRoundedIcon />}>Saved & history</Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard icon={<NewReleasesRoundedIcon fontSize="large" />} label="Fresh this week" value={stats.recentCount} sub="Items in your feed" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<TrendingUpRoundedIcon fontSize="large" />} label="Top item downloads" value={stats.topDl} sub="Most popular resource" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<ArticleRoundedIcon fontSize="large" />} label="Weekly activity" value={stats.weeklyHits} sub="Top 3 combined (approx)" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<SchoolRoundedIcon fontSize="large" />} label="For you" value={stats.recCount} sub="Recommendations" />
        </Grid>
      </Grid>

      {section("Recently added", "Latest uploads across the platform", data.recent)}
      {section("Popular downloads", "All-time top materials", data.popular)}
      {section("Popular this week", "Trending in the last 7 days", data.weeklyPopular)}
      {section("Recommended for you", "Based on your year, university, and activity", data.recommendations)}

      <Box sx={{ mb: 2 }}>
        <SectionHeader title="Recent activity" subtitle="Latest uploads with timestamps" />
        <Paper variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
          <List dense>
            {(activity || []).slice(0, 8).map((r) => (
              <ListItem key={r._id} divider secondaryAction={<Typography variant="caption" color="text.secondary">{new Date(r.createdAt).toLocaleString()}</Typography>}>
                <ListItemText primary={r.title} secondary={`${r.subject} · ${r.university}`} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItem>
            ))}
            {activity?.length === 0 && <ListItem><ListItemText primary="No activity yet — check back soon." /></ListItem>}
          </List>
        </Paper>
      </Box>
    </AppShell>
  );
};

const Resources = () => {
  const { api } = useAuth();
  const [list, setList] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", category: "", university: "", subject: "", yearSemester: "", page: 1 });
  const [busy, setBusy] = useState(false);
  const query = useMemo(() => new URLSearchParams(filters).toString(), [filters]);
  useEffect(() => {
    setBusy(true);
    api.get(`/resources?${query}`).then((r) => setList(r.data)).finally(() => setBusy(false));
  }, [api, query]);

  return (
    <AppShell title="Browse resources">
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>Find materials</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Search and filter by category, university, year, or subject. Results update as you type.</Typography>
        {busy && <LinearProgress sx={{ mb: 2 }} />}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Search title or description" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Subject / course" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value, page: 1 })} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField select fullWidth label="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}>
              <MenuItem value="">All categories</MenuItem>
              {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField select fullWidth label="University" value={filters.university} onChange={(e) => setFilters({ ...filters, university: e.target.value, page: 1 })}>
              <MenuItem value="">All universities</MenuItem>
              {universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField select fullWidth label="Year / semester" value={filters.yearSemester} onChange={(e) => setFilters({ ...filters, yearSemester: e.target.value, page: 1 })}>
              <MenuItem value="">Any</MenuItem>
              {yearSemesterOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", alignItems: "flex-end" }}>
            <Typography variant="body2" color="text.secondary">{list.total ?? 0} resources found · Page {filters.page} of {list.pages || 1}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={2}>
        {list.items.map((x) => <Grid item xs={12} sm={6} lg={4} key={x._id}><ResourceCard item={x} /></Grid>)}
      </Grid>
      {list.items?.length === 0 && !busy && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 2 }}>
          <Typography color="text.secondary">No resources match your filters. Try broadening your search.</Typography>
        </Paper>
      )}
      <Stack alignItems="center" sx={{ mt: 3 }}>
        <Pagination color="primary" count={list.pages || 1} page={filters.page} onChange={(_e, p) => setFilters({ ...filters, page: p })} />
      </Stack>
    </AppShell>
  );
};

const ResourceDetails = () => {
  const { api } = useAuth();
  const { id } = useParams();
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [data, setData] = useState({ item: null, related: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get(`/resources/${id}`).then((r) => setData(r.data)).finally(() => setLoading(false));
  }, [api, id]);

  const fileUrl = data.item?.fileUrl || data.item?.externalUrl || "";
  const showPdfPreview =
    Boolean(data.item?.fileUrl) && typeof fileUrl === "string" && /\.pdf($|\?|#)/i.test(fileUrl);

  const onDownload = async () => {
    try {
      const res = await api.post(`/resources/${id}/download`);
      window.open(res.data.url, "_blank");
      setSnack({ open: true, msg: "Download started.", severity: "success" });
    } catch (_e) {
      setSnack({ open: true, msg: "Download failed. Try again.", severity: "error" });
    }
  };
  const onBookmark = async () => {
    try {
      await api.post(`/profile/bookmarks/${id}`);
      setSnack({ open: true, msg: "Saved to your bookmarks.", severity: "success" });
    } catch (_e) {
      setSnack({ open: true, msg: "Could not update bookmark.", severity: "error" });
    }
  };

  if (loading) {
    return (
      <AppShell title="Resource">
        <LinearProgress />
      </AppShell>
    );
  }
  if (!data.item) {
    return (
      <AppShell title="Not found">
        <Alert severity="warning">This resource could not be loaded.</Alert>
      </AppShell>
    );
  }

  return (
    <AppShell title={data.item.title}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Chip label={data.item.category} color="primary" variant="outlined" />
              <Chip label={data.item.subject} />
              <Chip label={data.item.yearSemester} variant="outlined" />
              <Chip label={data.item.university} />
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>{data.item.title}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{data.item.description}</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
              <Button variant="contained" size="large" startIcon={<DownloadRoundedIcon />} onClick={onDownload}>Download / Open</Button>
              <Button variant="outlined" size="large" startIcon={<BookmarkRoundedIcon />} onClick={onBookmark}>Save to profile</Button>
            </Stack>
            <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">Total downloads: {data.item.downloadCount ?? 0}</Typography>
          </Paper>
          {showPdfPreview && (
            <Paper sx={{ p: 2, display: { xs: "none", md: "block" } }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Preview</Typography>
              <Box sx={{ height: 560, borderRadius: 2, overflow: "hidden", border: 1, borderColor: "divider" }}>
                <iframe title="pdf-preview" src={fileUrl} width="100%" height="100%" style={{ border: "none" }} />
              </Box>
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} lg={5}>
          <Typography variant="h6" sx={{ mb: 2 }}>Related resources</Typography>
          <Stack spacing={2}>{data.related.map((x) => <ResourceCard key={x._id} item={x} />)}</Stack>
        </Grid>
      </Grid>
      <Snackbar open={snack.open} autoHideDuration={2800} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </AppShell>
  );
};

const Profile = () => {
  const { api, user: authUser } = useAuth();
  const [data, setData] = useState({ user: null, downloadHistory: [] });
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get("/profile").then((r) => setData(r.data)).finally(() => setLoading(false));
  }, [api]);

  return (
    <AppShell title="My profile">
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Avatar sx={{ width: 88, height: 88, mx: "auto", mb: 2, fontSize: 40, bgcolor: "primary.main" }}>{data.user?.fullName?.charAt(0) || "?"}</Avatar>
            <Typography variant="h6" fontWeight={800}>{data.user?.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{data.user?.email}</Typography>
            <Chip sx={{ mt: 1.5 }} label={data.user?.universityName} size="small" />
            <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">Student ID: {data.user?.studentId}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}><strong>Year / semester:</strong> {data.user?.yearSemester}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 2 }}>
            <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="fullWidth">
              <Tab label="Downloads" />
              <Tab label="Saved" />
              <Tab label="Account" />
            </Tabs>
          </Paper>
          {tab === 0 && (
            <Paper variant="outlined" sx={{ p: 0 }}>
              <List>
                {data.downloadHistory.map((x) =>
                  x.resource?._id ? (
                    <ListItem key={x._id} disablePadding divider>
                      <ListItemButton component={Link} to={`/resources/${x.resource._id}`} sx={{ py: 2 }}>
                        <ListItemIcon><DownloadRoundedIcon color="primary" /></ListItemIcon>
                        <ListItemText primary={x.resource?.title || "Unknown"} secondary={new Date(x.lastDownloadedAt).toLocaleString()} primaryTypographyProps={{ fontWeight: 600 }} />
                      </ListItemButton>
                    </ListItem>
                  ) : (
                    <ListItem key={x._id} divider sx={{ py: 2 }}>
                      <ListItemIcon><DownloadRoundedIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="Unknown resource" secondary={new Date(x.lastDownloadedAt).toLocaleString()} />
                    </ListItem>
                  )
                )}
                {data.downloadHistory?.length === 0 && <ListItem><ListItemText primary="No downloads yet — explore the library." /></ListItem>}
              </List>
            </Paper>
          )}
          {tab === 1 && (
            <Grid container spacing={2}>
              {(data.user?.bookmarks || []).map((b) => (
                <Grid item xs={12} sm={6} key={b._id}><ResourceCard item={b} /></Grid>
              ))}
              {(!data.user?.bookmarks || data.user.bookmarks.length === 0) && (
                <Grid item xs={12}><Paper sx={{ p: 4, textAlign: "center" }}><Typography color="text.secondary">No saved resources yet.</Typography></Paper></Grid>
              )}
            </Grid>
          )}
          {tab === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">Signed in as</Typography>
              <Typography fontWeight={700}>{authUser?.email}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">Role: <strong>{authUser?.role}</strong></Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Use Browse Resources to discover materials; downloads and bookmarks appear in the tabs above.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </AppShell>
  );
};

const Admin = () => {
  const { api } = useAuth();
  const [tab, setTab] = useState(0);
  const [resources, setResources] = useState([]);
  const [blog, setBlog] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    subject: "",
    yearSemester: "Year 1 - Semester 1",
    university: universities[0],
    externalUrl: ""
  });
  const [files, setFiles] = useState({ file: null, thumbnail: null });
  const [tip, setTip] = useState({ title: "", content: "" });
  const [editRes, setEditRes] = useState(null);
  const [editBlog, setEditBlog] = useState(null);

  const load = () => {
    api.get("/resources?limit=200&page=1").then((r) => setResources(r.data.items || []));
    api.get("/blog").then((r) => setBlog(r.data));
    api.get("/contact").then((r) => setContacts(r.data)).catch(() => setContacts([]));
  };
  useEffect(load, [api]);

  const upload = async () => {
    try {
      setBusy(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.file) fd.append("file", files.file);
      if (files.thumbnail) fd.append("thumbnail", files.thumbnail);
      await api.post("/resources", fd);
      setForm({ ...form, title: "", description: "", subject: "", externalUrl: "" });
      setFiles({ file: null, thumbnail: null });
      setMessage("Resource uploaded successfully.");
      load();
    } catch (e) {
      setMessage(e?.response?.data?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveEditResource = async () => {
    if (!editRes?._id) return;
    await api.put(`/resources/${editRes._id}`, {
      title: editRes.title,
      description: editRes.description,
      category: editRes.category,
      subject: editRes.subject,
      yearSemester: editRes.yearSemester,
      university: editRes.university,
      externalUrl: editRes.externalUrl || ""
    });
    setEditRes(null);
    setMessage("Resource updated.");
    load();
  };

  const saveEditBlog = async () => {
    if (!editBlog?._id) return;
    await api.put(`/blog/${editBlog._id}`, { title: editBlog.title, content: editBlog.content });
    setEditBlog(null);
    setMessage("Article updated.");
    load();
  };

  const createTip = async () => {
    await api.post("/blog", tip);
    setTip({ title: "", content: "" });
    setMessage("Study tip published.");
    load();
  };

  return (
    <AppShell title="Admin console">
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, background: "linear-gradient(120deg, #1e3a5f 0%, #1158c7 100%)", color: "common.white" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.85 }}>ADMINISTRATION</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Manage the resource hub</Typography>
            <Typography sx={{ mt: 1, opacity: 0.9 }}>Upload files, curate the library, publish study tips, and read student messages.</Typography>
          </Box>
          <CloudUploadRoundedIcon sx={{ fontSize: 64, opacity: 0.35 }} />
        </Stack>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Upload resource" icon={<CloudUploadRoundedIcon />} iconPosition="start" />
          <Tab label="Resource library" icon={<FolderOpenRoundedIcon />} iconPosition="start" />
          <Tab label="Study tips" icon={<ArticleRoundedIcon />} iconPosition="start" />
          <Tab label="Inbox" icon={<EmailRoundedIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>New resource</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Attach a PDF, PPT, or DOCX, or paste an external link for reference materials. Optional thumbnail improves discoverability.</Typography>
          {busy && <LinearProgress sx={{ mb: 2 }} />}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth required label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth required label="Subject / course" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth required label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="Year / semester" value={form.yearSemester} onChange={(e) => setForm({ ...form, yearSemester: e.target.value })}>{yearSemesterOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth label="University" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>{universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><TextField fullWidth label="External URL (for Reference Links or hosted files)" value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} helperText="Optional if you upload a file below." /></Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5 }}>
                {files.file ? files.file.name : "Choose resource file"}
                <input hidden type="file" onChange={(e) => setFiles({ ...files, file: e.target.files?.[0] || null })} />
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5 }}>
                {files.thumbnail ? files.thumbnail.name : "Optional thumbnail image"}
                <input hidden type="file" accept="image/*" onChange={(e) => setFiles({ ...files, thumbnail: e.target.files?.[0] || null })} />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" size="large" startIcon={<CloudUploadRoundedIcon />} disabled={busy} onClick={upload}>Publish resource</Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell align="right">Downloads</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell><Typography fontWeight={600}>{r.title}</Typography></TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell align="right">{r.downloadCount ?? 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit metadata"><IconButton size="small" onClick={() => setEditRes({ ...r })}><EditRoundedIcon /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={async () => { await api.delete(`/resources/${r._id}`); setMessage("Deleted."); load(); }}><DeleteOutlineRoundedIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {resources.length === 0 && <Typography sx={{ p: 3 }} color="text.secondary">No resources yet.</Typography>}
        </TableContainer>
      )}

      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>New study tip</Typography>
              <Stack spacing={2}>
                <TextField label="Title" fullWidth value={tip.title} onChange={(e) => setTip({ ...tip, title: e.target.value })} />
                <TextField label="Content" fullWidth multiline rows={6} value={tip.content} onChange={(e) => setTip({ ...tip, content: e.target.value })} />
                <Button variant="contained" onClick={createTip}>Publish tip</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" sx={{ mb: 2 }}>Published articles</Typography>
            <Stack spacing={2}>
              {blog.map((x) => (
                <Paper key={x._id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box>
                      <Typography fontWeight={800}>{x.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{x.content?.slice(0, 180)}{x.content?.length > 180 ? "…" : ""}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(x.createdAt).toLocaleString()}</Typography>
                    </Box>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => setEditBlog({ ...x })}><EditRoundedIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={async () => { await api.delete(`/blog/${x._id}`); setMessage("Article removed."); load(); }}><DeleteOutlineRoundedIcon /></IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
              {blog.length === 0 && <Typography color="text.secondary">No articles yet.</Typography>}
            </Stack>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Paper variant="outlined" sx={{ p: 0 }}>
          <List>
            {contacts.map((c) => (
              <ListItem key={c._id} alignItems="flex-start" divider>
                <ListItemText
                  primary={<Typography fontWeight={700}>{c.fullName} · {c.email}</Typography>}
                  secondary={<><Typography variant="body2" sx={{ mt: 1 }}>{c.message}</Typography><Typography variant="caption" color="text.secondary">{new Date(c.createdAt).toLocaleString()}</Typography></>}
                />
              </ListItem>
            ))}
            {contacts.length === 0 && <ListItem><ListItemText primary="No messages yet." secondary="Student submissions will appear here." /></ListItem>}
          </List>
        </Paper>
      )}

      <Dialog open={Boolean(editRes)} onClose={() => setEditRes(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit resource</DialogTitle>
        <DialogContent>
          {editRes && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Title" fullWidth value={editRes.title} onChange={(e) => setEditRes({ ...editRes, title: e.target.value })} />
              <TextField label="Description" fullWidth multiline rows={3} value={editRes.description} onChange={(e) => setEditRes({ ...editRes, description: e.target.value })} />
              <TextField select fullWidth label="Category" value={editRes.category} onChange={(e) => setEditRes({ ...editRes, category: e.target.value })}>{categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
              <TextField label="Subject" fullWidth value={editRes.subject} onChange={(e) => setEditRes({ ...editRes, subject: e.target.value })} />
              <TextField select fullWidth label="Year / semester" value={editRes.yearSemester} onChange={(e) => setEditRes({ ...editRes, yearSemester: e.target.value })}>{yearSemesterOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}</TextField>
              <TextField select fullWidth label="University" value={editRes.university} onChange={(e) => setEditRes({ ...editRes, university: e.target.value })}>{universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}</TextField>
              <TextField label="External URL" fullWidth value={editRes.externalUrl || ""} onChange={(e) => setEditRes({ ...editRes, externalUrl: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRes(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEditResource}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editBlog)} onClose={() => setEditBlog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit article</DialogTitle>
        <DialogContent>
          {editBlog && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Title" fullWidth value={editBlog.title} onChange={(e) => setEditBlog({ ...editBlog, title: e.target.value })} />
              <TextField label="Content" fullWidth multiline rows={8} value={editBlog.content} onChange={(e) => setEditBlog({ ...editBlog, content: e.target.value })} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBlog(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEditBlog}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={2600} onClose={() => setMessage("")}>
        <Alert
          severity={/fail|error/i.test(message) ? "error" : "success"}
          variant="filled"
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
};

const Blog = () => {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get("/blog").then((r) => setPosts(r.data)).finally(() => setLoading(false));
  }, [api]);

  return (
    <AppShell title="Study tips">
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>Exam strategies & study habits</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Short reads from your administrators — techniques that work in Ethiopian university contexts.</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Stack spacing={2}>
        {posts.map((p) => (
          <Paper key={p._id} sx={{ p: { xs: 2, md: 3 }, borderLeft: 4, borderColor: "secondary.main" }}>
            <Typography variant="overline" color="text.secondary">{new Date(p.createdAt).toLocaleDateString()}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{p.title}</Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{p.content}</Typography>
          </Paper>
        ))}
        {posts.length === 0 && !loading && <Paper sx={{ p: 4, textAlign: "center" }}><Typography color="text.secondary">Tips coming soon.</Typography></Paper>}
      </Stack>
    </AppShell>
  );
};

const Contact = () => {
  const { api, user } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: user?.email || "", fullName: user?.fullName || "", message: "" });

  const send = async () => {
    try {
      setBusy(true);
      await api.post("/contact", form);
      setForm({ ...form, message: "" });
      setMessage("Thanks — your message was delivered.");
    } catch (_e) {
      setMessage("Could not send. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Contact">
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: "100%", bgcolor: "primary.main", color: "common.white" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>We read every message</Typography>
            <Typography sx={{ opacity: 0.92, mb: 2 }}>Questions about materials, broken links, or suggestions — send them here. Admins can review submissions in the Admin console.</Typography>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.25)", my: 2 }} />
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Tip: include your university and course name for faster help.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <TextField label="Email" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <TextField label="Full name" fullWidth value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <TextField label="Your message" fullWidth multiline rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <Button variant="contained" size="large" disabled={busy} onClick={send}>Send message</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={Boolean(message)} autoHideDuration={3200} onClose={() => setMessage("")}>
        <Alert severity={message.startsWith("Thanks") ? "success" : "error"} variant="filled" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>
    </AppShell>
  );
};

const HomeRoute = () => {
  const { token } = useAuth();
  return token ? <Dashboard /> : <Welcome />;
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/register" element={<AuthPage type="register" />} />
        <Route path="/resources" element={<Protected><Resources /></Protected>} />
        <Route path="/resources/:id" element={<Protected><ResourceDetails /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/blog" element={<Protected><Blog /></Protected>} />
        <Route path="/contact" element={<Protected><Contact /></Protected>} />
        <Route path="/admin" element={<AdminProtected><Admin /></AdminProtected>} />
      </Routes>
    </ThemeProvider>
  );
}
