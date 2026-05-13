import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme
} from "@mui/material";
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

const theme = createTheme({
  palette: {
    primary: { main: "#1363df" },
    secondary: { main: "#00b894" },
    background: { default: "#f5f7fb" }
  },
  shape: { borderRadius: 12 }
});

const Protected = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AdminProtected = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/" />;
  return children;
};

const Layout = ({ children }) => {
  const { token, user, logout } = useAuth();
  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Ethiopia University Resource Hub
          </Typography>
          {!token && (
            <>
              <Button color="inherit" component={Link} to="/">Welcome</Button>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button variant="contained" color="secondary" component={Link} to="/register">Create Account</Button>
            </>
          )}
          {token && (
            <>
              <Button color="inherit" component={Link} to="/">Dashboard</Button>
              <Button color="inherit" component={Link} to="/resources">Resources</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
              <Button color="inherit" component={Link} to="/blog">Study Tips</Button>
              <Button color="inherit" component={Link} to="/contact">Contact</Button>
              {user?.role === "admin" && <Button color="inherit" component={Link} to="/admin">Admin</Button>}
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>{children}</Container>
    </>
  );
};

const Welcome = () => (
  <Layout>
    <Paper sx={{ p: { xs: 3, md: 6 }, mb: 4, background: "linear-gradient(130deg, #e8f1ff 0%, #f6fffb 100%)" }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
        University Student Resource Hub
      </Typography>
      <Typography variant="h6" sx={{ color: "text.secondary", mb: 3 }}>
        A modern academic platform tailored for Ethiopian university students to access quality study resources, past exams, and practical guides.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button variant="contained" size="large" component={Link} to="/register">
          Start Learning
        </Button>
        <Button variant="outlined" size="large" component={Link} to="/login">
          Login
        </Button>
      </Stack>
    </Paper>

    <Grid container spacing={2}>
      {[
        ["Structured Dashboard", "Get recent uploads, weekly top resources, and personalized recommendations."],
        ["Powerful Search", "Filter by category, university, year/semester, and subject."],
        ["Reliable Downloads", "Track popular files and keep your own download history."],
        ["Study Tips Blog", "Learn exam strategy and effective university study methods."],
        ["Admin Resource Control", "Upload, edit, and manage resources with secure admin-only tools."],
        ["Mobile-Friendly UI", "Clean responsive experience for phone, tablet, and desktop."]
      ].map(([title, desc]) => (
        <Grid item xs={12} md={6} lg={4} key={title}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{title}</Typography>
              <Typography color="text.secondary">{desc}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Layout>
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
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Request failed. Please check your inputs.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Layout>
      <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{isRegister ? "Create Student Account" : "Welcome Back"}</Typography>
          <Typography color="text.secondary">{isRegister ? "Register once and access all campus resources." : "Login to continue to your dashboard."}</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {isRegister && <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />}
        {isRegister && <TextField label="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />}
        {isRegister && (
          <TextField select label="University" value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })}>
            {universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
        )}
        {isRegister && (
          <TextField select label="Year/Semester" value={form.yearSemester} onChange={(e) => setForm({ ...form, yearSemester: e.target.value })}>
            {yearSemesterOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField>
        )}
        <TextField type="password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {busy && <LinearProgress />}
          <Button disabled={busy} variant="contained" onClick={submit}>{isRegister ? "Create Account" : "Login"}</Button>
        <Button component={Link} to={isRegister ? "/login" : "/register"}>{isRegister ? "Already have account?" : "Create new account"}</Button>
        </Stack>
      </Paper>
    </Layout>
  );
};

const Dashboard = () => {
  const { api } = useAuth();
  const [data, setData] = useState({ recent: [], popular: [], weeklyPopular: [], recommendations: [] });
  useEffect(() => { api.get("/dashboard").then((r) => setData(r.data)); }, [api]);
  const section = (title, items) => (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Grid container spacing={2}>{items.map((x) => <Grid item xs={12} md={6} lg={4} key={x._id}><ResourceCard item={x} /></Grid>)}</Grid>
    </Box>
  );
  return (
    <Layout>
      <Stack spacing={3}>
        <Typography variant="h4">Student Dashboard</Typography>
        {section("Recently Added", data.recent)}
        {section("Popular Downloads (Top 5)", data.popular)}
        {section("Popular This Week", data.weeklyPopular)}
        {section("Recommended for You", data.recommendations)}
      </Stack>
    </Layout>
  );
};

const ResourceCard = ({ item }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title}</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>{item.description.slice(0, 120)}</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
        <Chip label={item.category} size="small" />
        <Chip label={item.subject} size="small" />
        <Chip label={`Downloads: ${item.downloadCount || 0}`} size="small" />
      </Stack>
      <Button component={Link} to={`/resources/${item._id}`}>Open</Button>
    </CardContent>
  </Card>
);

const Resources = () => {
  const { api } = useAuth();
  const [list, setList] = useState({ items: [], page: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: "", category: "", university: "", subject: "", yearSemester: "", page: 1 });
  const [busy, setBusy] = useState(false);
  const query = useMemo(() => new URLSearchParams(filters).toString(), [filters]);
  useEffect(() => {
    setBusy(true);
    api.get(`/resources?${query}`).then((r) => setList(r.data)).finally(() => setBusy(false));
  }, [api, query]);
  return (
    <Layout>
      <Stack spacing={2}>
        <Typography variant="h4">Browse Resources</Typography>
        {busy && <LinearProgress />}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Subject" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value, page: 1 })} /></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}><MenuItem value="">All</MenuItem>{categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="University" value={filters.university} onChange={(e) => setFilters({ ...filters, university: e.target.value, page: 1 })}><MenuItem value="">All</MenuItem>{universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}</TextField></Grid>
        </Grid>
        <Grid container spacing={2}>{list.items.map((x) => <Grid item xs={12} md={6} key={x._id}><ResourceCard item={x} /></Grid>)}</Grid>
        <Pagination count={list.pages || 1} page={filters.page} onChange={(_e, p) => setFilters({ ...filters, page: p })} />
      </Stack>
    </Layout>
  );
};

const ResourceDetails = () => {
  const { api } = useAuth();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [data, setData] = useState({ item: null, related: [] });
  useEffect(() => { api.get(`/resources/${id}`).then((r) => setData(r.data)); }, [api, id]);
  if (!data.item) return null;
  const onDownload = async () => {
    try {
      const res = await api.post(`/resources/${id}/download`);
      window.open(res.data.url, "_blank");
    } catch (_e) {
      setMessage("Download failed. Please try again.");
    }
  };
  const onBookmark = async () => {
    await api.post(`/profile/bookmarks/${id}`);
    setMessage("Bookmark updated.");
  };
  return (
    <Layout>
      <Stack spacing={2}>
        <Typography variant="h4">{data.item.title}</Typography>
        <Typography>{data.item.description}</Typography>
        <Stack direction="row" spacing={1}><Chip label={data.item.category} /><Chip label={data.item.subject} /><Chip label={data.item.yearSemester} /></Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onDownload}>Download</Button>
          <Button variant="outlined" onClick={onBookmark}>Save</Button>
        </Stack>
        <Typography variant="h6">Related Resources</Typography>
        <Grid container spacing={2}>{data.related.map((x) => <Grid item xs={12} md={6} key={x._id}><ResourceCard item={x} /></Grid>)}</Grid>
        <Snackbar open={Boolean(message)} autoHideDuration={2200} onClose={() => setMessage("")}>
          <Alert severity="success" variant="filled">{message}</Alert>
        </Snackbar>
      </Stack>
    </Layout>
  );
};

const Profile = () => {
  const { api } = useAuth();
  const [data, setData] = useState({ user: null, downloadHistory: [] });
  useEffect(() => { api.get("/profile").then((r) => setData(r.data)); }, [api]);
  return (
    <Layout>
      <Stack spacing={2}>
        <Typography variant="h4">Profile</Typography>
        {data.user && <Typography>{data.user.fullName} - {data.user.universityName}</Typography>}
        <Divider />
        <Typography variant="h6">Download History</Typography>
        {data.downloadHistory.map((x) => <Typography key={x._id}>{x.resource?.title} ({new Date(x.lastDownloadedAt).toLocaleString()})</Typography>)}
        <Divider />
        <Typography variant="h6">Saved Resources</Typography>
        <Grid container spacing={2}>{(data.user?.bookmarks || []).map((b) => <Grid item xs={12} md={6} key={b._id}><ResourceCard item={b} /></Grid>)}</Grid>
      </Stack>
    </Layout>
  );
};

const Admin = () => {
  const { api } = useAuth();
  const [resources, setResources] = useState([]);
  const [blog, setBlog] = useState([]);
  const [message, setMessage] = useState("");
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
  const load = () => {
    api.get("/resources").then((r) => setResources(r.data.items));
    api.get("/blog").then((r) => setBlog(r.data));
  };
  useEffect(load, [api]);
  const upload = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (files.file) fd.append("file", files.file);
    if (files.thumbnail) fd.append("thumbnail", files.thumbnail);
    await api.post("/resources", fd);
    setMessage("Resource uploaded.");
    load();
  };
  const createTip = async () => {
    await api.post("/blog", tip);
    setTip({ title: "", content: "" });
    setMessage("Study tip created.");
    load();
  };
  return (
    <Layout>
      <Stack spacing={3}>
        <Typography variant="h4">Admin Console</Typography>
        <Typography variant="h6">Upload Resource</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Year/Semester" value={form.yearSemester} onChange={(e) => setForm({ ...form, yearSemester: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="University" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>{universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="External URL (for links)" value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><Button variant="outlined" component="label">Resource File<input hidden type="file" onChange={(e) => setFiles({ ...files, file: e.target.files[0] })} /></Button></Grid>
          <Grid item xs={12} md={3}><Button variant="outlined" component="label">Thumbnail<input hidden type="file" onChange={(e) => setFiles({ ...files, thumbnail: e.target.files[0] })} /></Button></Grid>
        </Grid>
        <Button variant="contained" onClick={upload}>Upload Resource</Button>

        <Typography variant="h6">Study Tips Blog CRUD</Typography>
        <TextField label="Tip title" value={tip.title} onChange={(e) => setTip({ ...tip, title: e.target.value })} />
        <TextField label="Tip content" value={tip.content} onChange={(e) => setTip({ ...tip, content: e.target.value })} multiline rows={4} />
        <Button variant="contained" onClick={createTip}>Create Tip</Button>
        {blog.map((x) => <Typography key={x._id}>- {x.title}</Typography>)}

        <Typography variant="h6">Manage Resources</Typography>
        {resources.map((r) => (
          <Stack key={r._id} direction="row" spacing={2} alignItems="center">
            <Typography>{r.title}</Typography>
            <Button size="small" onClick={async () => { await api.delete(`/resources/${r._id}`); setMessage("Resource deleted."); load(); }}>Delete</Button>
          </Stack>
        ))}
        <Snackbar open={Boolean(message)} autoHideDuration={2000} onClose={() => setMessage("")}>
          <Alert severity="success" variant="filled">{message}</Alert>
        </Snackbar>
      </Stack>
    </Layout>
  );
};

const Blog = () => {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  useEffect(() => { api.get("/blog").then((r) => setPosts(r.data)); }, [api]);
  return (
    <Layout>
      <Typography variant="h4">Study Tips Blog</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>{posts.map((p) => <Card key={p._id}><CardContent><Typography variant="h6">{p.title}</Typography><Typography>{p.content}</Typography></CardContent></Card>)}</Stack>
    </Layout>
  );
};

const Contact = () => {
  const { api, user } = useAuth();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ email: user?.email || "", fullName: user?.fullName || "", message: "" });
  return (
    <Layout>
      <Stack spacing={2} maxWidth={600}>
        <Typography variant="h4">Contact Admin</Typography>
        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <TextField label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} multiline rows={5} />
        <Button variant="contained" onClick={async () => { await api.post("/contact", form); setForm({ ...form, message: "" }); setMessage("Message sent."); }}>Send</Button>
        <Snackbar open={Boolean(message)} autoHideDuration={2200} onClose={() => setMessage("")}>
          <Alert severity="success" variant="filled">{message}</Alert>
        </Snackbar>
      </Stack>
    </Layout>
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
