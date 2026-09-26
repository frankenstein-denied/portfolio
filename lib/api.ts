import { collection, doc, addDoc, getDocs, query, where, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import { projects as seedProjects, type Comment, type Project } from '@/data/profile'
import { answerFromFaq } from './faq'

function formatTime(ts?: Timestamp) {
  if (!ts) return 'just now'
  const minutes = Math.floor((Date.now() - ts.toMillis()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export async function getProjects(): Promise<Project[]> {
  const [heartsSnap, commentsSnap] = await Promise.all([
    getDocs(collection(db, 'hearts')),
    getDocs(collection(db, 'comments')),
  ])
  const likeCounts = new Map<string, number>()
  heartsSnap.forEach(d => likeCounts.set(d.id, (d.data().count as number) ?? 0))
  const commentCounts = new Map<string, number>()
  commentsSnap.forEach(d => { const pid = d.data().projectId as string; commentCounts.set(pid, (commentCounts.get(pid) ?? 0) + 1) })
  return seedProjects.map(p => ({ ...p, likes: likeCounts.get(p.id) ?? p.likes, comments: commentCounts.get(p.id) ?? p.comments }))
}

export async function toggleHeart(id: string, liked: boolean): Promise<number> {
  const ref = doc(db, 'hearts', id)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists() ? (snap.data().count as number) ?? 0 : 0
    const next = Math.max(0, current + (liked ? 1 : -1))
    tx.set(ref, { count: next })
    return next
  })
}

export async function getComments(projectId: string): Promise<Comment[]> {
  const snap = await getDocs(query(collection(db, 'comments'), where('projectId', '==', projectId)))
  const docs = snap.docs.map(d => d.data())
  docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
  return docs.map(data => ({ name: data.name as string, text: data.text as string, time: formatTime(data.createdAt as Timestamp | undefined) }))
}

export async function addComment(projectId: string, comment: Comment) {
  const name = comment.name.trim().slice(0, 60)
  const text = comment.text.trim().slice(0, 500)
  if (!name || !text) throw new Error('Name and comment text are required')
  await addDoc(collection(db, 'comments'), { projectId, name, text, createdAt: serverTimestamp() })
  return { projectId, comment: { name, text, time: 'just now' } }
}

export async function askPeterAI(message: string, history: { role: string; content: string }[] = []) { void history; return answerFromFaq(message) }
