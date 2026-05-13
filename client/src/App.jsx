import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import { useAuth } from "./state.jsx";

const categories = ["Lecture Notes", "Previous Exams", "Textbooks/PPTs", "Research Papers", "Lab Manuals", "Reference Links"];
const universities = ["Addis Ababa University", "Bahir Dar University", "Jimma University", "Mekelle University", "ASTU", "Other Ethiopian Universities"];

const Protected = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6">University Resource Hub</Typography>
          {user && (
            <>
              <Button color="inherit" component={Link} to="/">Dashboard</Button>
              <Button color="inherit" component={Link} to="/resources">Browse</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
              <Button color="inherit" component={Link} to="/blog">Study Tips</Button>
              <Button color="inherit" component={Link} to="/contact">Contact</Button>
              {user.role === "admin" && <Button color="inherit" component={Link} to="/admin">Admin</Button>}
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>{children}</Container>
    </>
  );
};

const AuthPage = ({ type }) => {
  const isRegister = type === "register";
  const { api, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    universityName: "Addis Ababa University",
    studentId: "",
    password: "",
    yearSemester: "Year 1 - Semester 1"
  });
  const submit = async () => {
    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const res = await api.post(endpoint, form);
    login(res.data);
    navigate("/");
  };
  return (
    <Layout>
      <Stack spacing={2} maxWidth={500}>
        <Typography variant="h4">{isRegister ? "Student Registration" : "Login"}</Typography>
        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {isRegister && <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />}
        {isRegister && <TextField label="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />}
        {isRegister && (
          <TextField select label="University" value={form.universityName} onChange={(e) => setForm({ ...form, universityName: e.target.value })}>
            {universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
        )}
        {isRegister && <TextField label="Year/Semester" value={form.yearSemester} onChange={(e) => setForm({ ...form, yearSemester: e.target.value })} />}
        <TextField type="password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button variant="contained" onClick={submit}>{isRegister ? "Create Account" : "Login"}</Button>
        <Button component={Link} to={isRegister ? "/login" : "/register"}>{isRegister ? "Already have account?" : "Create new account"}</Button>
      </Stack>
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
  <Card>
    <CardContent>
      <Typography variant="h6">{item.title}</Typography>
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
  const query = useMemo(() => new URLSearchParams(filters).toString(), [filters]);
  useEffect(() => { api.get(`/resources?${query}`).then((r) => setList(r.data)); }, [api, query]);
  return (
    <Layout>
      <Stack spacing={2}>
        <Typography variant="h4">Browse Resources</Typography>
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
  const [data, setData] = useState({ item: null, related: [] });
  useEffect(() => { api.get(`/resources/${id}`).then((r) => setData(r.data)); }, [api, id]);
  if (!data.item) return null;
  const onDownload = async () => {
    const res = await api.post(`/resources/${id}/download`);
    window.open(res.data.url, "_blank");
  };
  return (
    <Layout>
      <Stack spacing={2}>
        <Typography variant="h4">{data.item.title}</Typography>
        <Typography>{data.item.description}</Typography>
        <Stack direction="row" spacing={1}><Chip label={data.item.category} /><Chip label={data.item.subject} /><Chip label={data.item.yearSemester} /></Stack>
        <Button variant="contained" onClick={onDownload}>Download</Button>
        <Typography variant="h6">Related Resources</Typography>
        <Grid container spacing={2}>{data.related.map((x) => <Grid item xs={12} md={6} key={x._id}><ResourceCard item={x} /></Grid>)}</Grid>
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
        <Typography variant="h6">Download History</Typography>
        {data.downloadHistory.map((x) => <Typography key={x._id}>{x.resource?.title} ({new Date(x.lastDownloadedAt).toLocaleString()})</Typography>)}
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
    load();
  };
  const createTip = async () => {
    await api.post("/blog", tip);
    setTip({ title: "", content: "" });
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
            <Button size="small" onClick={async () => { await api.delete(`/resources/${r._id}`); load(); }}>Delete</Button>
          </Stack>
        ))}
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
  const [form, setForm] = useState({ email: user?.email || "", fullName: user?.fullName || "", message: "" });
  return (
    <Layout>
      <Stack spacing={2} maxWidth={600}>
        <Typography variant="h4">Contact Admin</Typography>
        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <TextField label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} multiline rows={5} />
        <Button variant="contained" onClick={async () => { await api.post("/contact", form); setForm({ ...form, message: "" }); }}>Send</Button>
      </Stack>
    </Layout>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage type="login" />} />
      <Route path="/register" element={<AuthPage type="register" />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/resources" element={<Protected><Resources /></Protected>} />
      <Route path="/resources/:id" element={<Protected><ResourceDetails /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/blog" element={<Protected><Blog /></Protected>} />
      <Route path="/contact" element={<Protected><Contact /></Protected>} />
      <Route path="/admin" element={<Protected><Admin /></Protected>} />
    </Routes>
  );
}
